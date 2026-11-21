import { useState } from "react";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { removeListingImages } from "../lib/storage";
import { formatRupiah } from "../lib/format";
import { useAuth } from "../hooks/useAuth";
import { useMyListings } from "../hooks/useMyListings";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import NonNegativeNumberInput from "../components/ui/NonNegativeNumberInput";
import Spinner from "../components/ui/Spinner";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import RatingSummary from "../components/reviews/RatingSummary";

const STATUS = {
  pending: { label: "Menunggu persetujuan", className: "bg-gold text-ink" },
  approved: { label: "Tayang", className: "bg-mint text-ink" },
  rejected: { label: "Ditolak", className: "bg-red-100 text-red-800" },
  sold: { label: "Terjual", className: "bg-ink/10 text-ink" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { listings, loading, error, refetch } = useMyListings();
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [sellQuantities, setSellQuantities] = useState({});

  const run = async (id, action) => {
    setBusyId(id);
    setActionError("");
    const { error: actionErr, message } = await action();
    setBusyId(null);
    if (actionErr) {
      setActionError(message || "Aksi gagal. Coba lagi.");
      return;
    }
    refetch();
  };

  const sellUnits = (item, amount) =>
    run(item.id, async () => {
      const remaining = item.quantity - amount;
      const { data, error: updateError } = await supabase
        .from("listings")
        .update({
          ...(remaining > 0 ? { quantity: remaining } : {}),
          status: remaining === 0 ? "sold" : "approved",
        })
        .eq("id", item.id)
        .eq("seller_id", user.id)
        .eq("status", "approved")
        .eq("quantity", item.quantity)
        .gte("quantity", amount)
        .select("id")
        .maybeSingle();

      if (updateError) return { error: updateError };
      if (!data) {
        return {
          error: true,
          message: "Stok berubah atau jumlah melebihi stok. Muat ulang lalu coba lagi.",
        };
      }

      setSellQuantities((current) => ({ ...current, [item.id]: "1" }));
      return { error: null };
    });

  const handleSell = (event, item) => {
    event.preventDefault();
    const amount = Number(sellQuantities[item.id] ?? 1);
    if (!Number.isInteger(amount) || amount < 1 || amount > item.quantity) {
      setActionError(`Jumlah harus antara 1 dan ${item.quantity}.`);
      return;
    }
    sellUnits(item, amount);
  };

  const resubmit = (item) =>
    run(item.id, () =>
      supabase.from("listings").update({ status: "pending" }).eq("id", item.id),
    );

  const remove = (item) => {
    if (
      !window.confirm(
        `Hapus "${item.title}"? Percakapan terkait ikut terhapus.`,
      )
    )
      return;
    run(item.id, async () => {
      const result = await supabase.from("listings").delete().eq("id", item.id);
      if (!result.error) await removeListingImages(item.image_urls);
      return result;
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Barang saya</h1>
        <Link
          to="/listings/new"
          className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold hover:brightness-95"
        >
          Jual barang
        </Link>
      </div>

      <RatingSummary />

      {actionError && (
        <p role="alert" className="rounded-lg bg-gold/40 p-3 text-sm">
          {actionError}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : listings.length === 0 ? (
        <EmptyState
          title="Belum ada barang"
          description="Mulai jual barang bekas Anda lewat tombol di atas."
        />
      ) : (
        <ul className="space-y-3">
          {listings.map((item) => {
            const status = STATUS[item.status];
            const busy = busyId === item.id;
            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-mint/20">
                  {item.image_urls[0] ? (
                    <img
                      src={item.image_urls[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink/30">
                      <ImageOff className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/listings/${item.id}`}
                    className="line-clamp-1 font-semibold hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="font-bold">{formatRupiah(item.price)}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-ink/60">
                    <Badge className={status.className}>{status.label}</Badge>
                    <span>{item.categories?.name}</span>
                    {item.status !== "sold" && <span>{item.quantity} unit</span>}
                  </div>
                  {item.status === "rejected" && item.rejection_reason && (
                    <p className="mt-1 text-xs text-red-700">
                      Alasan ditolak: {item.rejection_reason}
                    </p>
                  )}
                </div>

                <div className="grid gap-2 border-t border-ink/10 pt-3 sm:w-52 sm:shrink-0 sm:border-t-0 sm:pt-0">
                  {item.status === "approved" && (
                    <form
                      onSubmit={(event) => handleSell(event, item)}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2"
                    >
                      <label
                        htmlFor={`sold-quantity-${item.id}`}
                        className="grid min-w-0 gap-1 text-xs font-semibold"
                      >
                        Jumlah terjual
                        <NonNegativeNumberInput
                          id={`sold-quantity-${item.id}`}
                          inputMode="numeric"
                          min="1"
                          max={item.quantity}
                          step="1"
                          required
                          value={sellQuantities[item.id] ?? 1}
                          onChange={(event) =>
                            setSellQuantities((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                          disabled={busy}
                          className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand"
                        />
                      </label>
                      <Button
                        type="submit"
                        variant="outline"
                        loading={busy}
                        className="min-w-[6rem]"
                      >
                        Terjual
                      </Button>
                    </form>
                  )}
                  {item.status === "rejected" && (
                    <Button loading={busy} onClick={() => resubmit(item)}>
                      Ajukan ulang
                    </Button>
                  )}
                  <div className="flex gap-2">
                    {item.status !== "sold" && (
                      <Link
                        to={`/listings/${item.id}/edit`}
                        className="flex flex-1 items-center justify-center rounded-lg border border-ink/20 bg-white px-3 py-2.5 text-center text-sm font-semibold hover:bg-mint/30"
                      >
                        Edit
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      loading={busy}
                      className="flex-1 text-red-700"
                      onClick={() => remove(item)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
