import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { formatRupiah } from "../../lib/format";
import Badge from "../ui/Badge";

const ctaClass =
  "block w-full rounded-lg bg-cta px-4 py-2.5 text-center text-sm font-semibold text-ink hover:brightness-95";

export default function BuyBox({ listing }) {
  const { user } = useAuth();
  const location = useLocation();

  const isOwner = user?.id === listing.seller_id;

  const renderAction = () => {
    if (listing.status === "sold") {
      return <Badge className="bg-ink/10 text-ink">Barang sudah terjual</Badge>;
    }
    if (listing.status !== "approved") {
      return (
        <Badge className="bg-gold text-ink">Menunggu persetujuan admin</Badge>
      );
    }
    if (isOwner) {
      return (
        <p className="text-sm">
          Ini barang Anda. Kelola di{" "}
          <Link to="/dashboard" className="font-semibold underline">
            Dashboard
          </Link>
          .
        </p>
      );
    }
    if (!user) {
      return (
        <Link to="/login" state={{ from: location }} className={ctaClass}>
          Masuk ke akun Anda
        </Link>
      );
    }
    return null;
  };

  return (
    <aside className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
      <p className="text-3xl font-bold">{formatRupiah(listing.price)}</p>

      {renderAction()}
      <p className="border-t border-ink/10 pt-3 text-sm">
        Dijual oleh <span className="font-semibold">{listing.sellerName}</span>
      </p>
    </aside>
  );
}
