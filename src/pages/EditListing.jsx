import { Link, useParams } from "react-router-dom";
import ListingForm from "../components/listings/ListingForm";
import Spinner from "../components/ui/Spinner";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { useListing } from "../hooks/useListings";
import { useAuth } from "../hooks/useAuth";

export default function EditListing() {
  const { id } = useParams();
  const { user } = useAuth();
  const { listing, loading, error, refetch } = useListing(id);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!listing || listing.seller_id !== user.id) {
    return (
      <EmptyState
        title="Barang tidak ditemukan"
        description="Barang ini tidak ada atau bukan milik Anda."
      />
    );
  }
  if (listing.status === "sold") {
    return (
      <EmptyState
        title="Barang sudah terjual"
        description="Barang yang sudah terjual tidak bisa diedit."
      />
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <h1 className="mb-1 text-2xl font-bold">Edit barang</h1>
      {listing.status === "rejected" && (
        <p className="mb-4 text-sm text-ink/70">
          Barang ini ditolak admin. Setelah Anda simpan, barang otomatis
          diajukan ulang.
        </p>
      )}
      <ListingForm listing={listing} />
      <Link
        to="/dashboard"
        className="mt-4 inline-block text-sm font-semibold text-nav-sub underline"
      >
        Batal
      </Link>
    </section>
  );
}
