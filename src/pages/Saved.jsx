import { useState } from "react";
import { useSavedListings } from "../hooks/useSavedListings";
import ListingCard from "../components/listings/ListingCard";
import Spinner from "../components/ui/Spinner";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";

export default function Saved() {
  const { listings, loading, error, refetch, remove } = useSavedListings();
  const [actionError, setActionError] = useState("");

  const handleRemove = async (id) => {
    setActionError("");
    const { error: removeError } = await remove(id);
    if (removeError) setActionError("Gagal menghapus dari simpanan.");
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Barang tersimpan</h1>

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
          title="Belum ada barang tersimpan"
          description="Tekan Simpan di halaman barang untuk menyimpannya di sini."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {listings.map((item) => (
            <div key={item.id} className="flex flex-col gap-1.5">
              {item.unavailable ? (
                <div className="flex aspect-square flex-col items-center justify-center rounded-xl bg-white p-4 text-center shadow-sm">
                  <p className="font-bold">Barang tidak lagi tersedia</p>
                  <p className="mt-1 text-xs text-ink/60">
                    Penjual atau admin sudah menurunkan barang ini.
                  </p>
                </div>
              ) : (
                <ListingCard listing={item} />
              )}
              <button
                onClick={() => handleRemove(item.id)}
                className="text-xs font-semibold text-red-700 hover:underline"
              >
                Hapus dari simpanan
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
