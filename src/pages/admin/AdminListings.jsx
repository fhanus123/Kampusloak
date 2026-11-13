import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { formatRupiah } from "../../lib/format";
import { useAdminListings } from "../../hooks/useAdminListings";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";

const TABS = [
  { value: "pending", label: "Menunggu" },
  { value: "approved", label: "Tayang" },
  { value: "rejected", label: "Ditolak" },
];

export default function AdminListings() {
  const [status, setStatus] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const { listings, loading, error, refetch } = useAdminListings(status);

  const review = async (id, decision, why = null) => {
    if (busyId !== null) return;
    setBusyId(id);
    setActionError("");
    const { error: rpcError } = await supabase.rpc("review_listing", {
      p_listing_id: id,
      p_decision: decision,
      p_reason: why,
    });
    setBusyId(null);
    if (rpcError) {
      setActionError(rpcError.message);
      return;
    }
    setRejectingId(null);
    setReason("");
    setFormError("");
    window.dispatchEvent(new Event("admin:updated"));
    refetch();
  };

  const submitReject = (id) => {
    if (busyId !== null) return;
    if (reason.trim().length < 5) {
      setFormError("Alasan minimal 5 karakter");
      return;
    }
    setFormError("");
    review(id, "rejected", reason.trim());
  };

  const handleDelete = async (item) => {
    if (busyId !== null) return;
    if (!window.confirm(`Hapus "${item.title}" beserta percakapannya?`)) return;
    setBusyId(item.id);
    setActionError("");
    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", item.id);
    setBusyId(null);
    if (deleteError) {
      setActionError("Gagal menghapus barang.");
      return;
    }
    window.dispatchEvent(new Event("admin:updated"));
    refetch();
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Tinjau barang</h1>

      <div className="flex gap-2" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={status === tab.value}
            disabled={busyId !== null}
            onClick={() => {
              setStatus(tab.value);
              setRejectingId(null);
              setReason("");
              setFormError("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              status === tab.value
                ? "bg-nav-sub text-white"
                : "bg-white hover:bg-mint/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
          title="Tidak ada barang"
          description="Belum ada barang pada status ini."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {listings.map((item) => {
            const busy = busyId !== null;
            const rejecting = rejectingId === item.id;
            return (
              <article
                key={item.id}
                className="space-y-3 rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-mint/20">
                    {item.image_urls[0] && (
                      <img
                        src={item.image_urls[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/listings/${item.id}`}
                      className="line-clamp-2 font-bold hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="font-bold">{formatRupiah(item.price)}</p>
                    <p className="text-xs text-ink/60">
                      {item.categories?.name} · Penjual: {item.sellerName} ·{" "}
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>

                {item.description && (
                  <p className="line-clamp-3 text-sm text-ink/80">
                    {item.description}
                  </p>
                )}
                {status === "rejected" && item.rejection_reason && (
                  <p className="rounded-lg bg-red-50 p-2 text-sm">
                    Alasan: {item.rejection_reason}
                  </p>
                )}

                {rejecting && (
                  <div>
                    <label
                      htmlFor={`reason-${item.id}`}
                      className="mb-1 block text-sm font-semibold"
                    >
                      Alasan penolakan
                    </label>
                    <textarea
                      id={`reason-${item.id}`}
                      rows={2}
                      value={reason}
                      disabled={busy}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Contoh: Foto tidak jelas atau barang melanggar aturan"
                      className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
                    />
                    {formError && (
                      <p className="mt-1 text-xs text-red-600">{formError}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {status !== "approved" && !rejecting && (
                    <Button
                      loading={busy}
                      onClick={() => review(item.id, "approved")}
                    >
                      Setujui
                    </Button>
                  )}
                  {status !== "rejected" && !rejecting && (
                    <Button
                      variant="outline"
                      loading={busy}
                      onClick={() => {
                        setRejectingId(item.id);
                        setReason("");
                        setFormError("");
                      }}
                    >
                      {status === "approved" ? "Turunkan" : "Tolak"}
                    </Button>
                  )}
                  {rejecting && (
                    <>
                      <Button
                        variant="outline"
                        loading={busy}
                        onClick={() => submitReject(item.id)}
                      >
                        Kirim penolakan
                      </Button>
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() => {
                          setRejectingId(null);
                          setReason("");
                          setFormError("");
                        }}
                      >
                        Batal
                      </Button>
                    </>
                  )}
                  {!rejecting && (
                    <Button
                      variant="outline"
                      loading={busy}
                      className="ml-auto text-red-700"
                      onClick={() => handleDelete(item)}
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
