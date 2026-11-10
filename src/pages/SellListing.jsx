import { Link } from "react-router-dom";
import { PackagePlus } from "lucide-react";
import ListingForm from "../components/listings/ListingForm";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";

export default function SellListing() {
  const { profile, isVerified } = useAuth();

  if (!profile)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint/40 text-brand">
          <PackagePlus className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand">KampusLoak</p>
          <h1 className="text-2xl font-bold">Jual barang</h1>
        </div>
      </div>

      {isVerified ? (
        <ListingForm />
      ) : (
        <div className="rounded-lg bg-gold/40 p-4 text-sm">
          <p className="font-semibold">Akun Anda belum terverifikasi.</p>
          <p className="mt-1">
            Penjual harus mahasiswa atau alumni UNSRI terverifikasi.
          </p>
          <Link
            to="/verification"
            className="mt-2 inline-block font-semibold underline"
          >
            Verifikasi sekarang
          </Link>
        </div>
      )}
    </section>
  );
}
