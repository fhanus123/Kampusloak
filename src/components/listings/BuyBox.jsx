import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import { formatRupiah } from "../../lib/format";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const ctaClass =
  "block w-full rounded-lg bg-cta px-4 py-2.5 text-center text-sm font-semibold text-ink hover:brightness-95";

export default function BuyBox({ listing }) {
  const { user, profile, isVerified } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const isOwner = user?.id === listing.seller_id;

  const startChat = async () => {
    setStarting(true);
    setError("");
    const { data, error: rpcError } = await supabase.rpc("start_conversation", {
      p_listing_id: listing.id,
    });
    setStarting(false);
    if (rpcError) {
      setError("Gagal membuka percakapan. Coba lagi.");
      return;
    }
    navigate(`/chat/${data}`, {
      state: {
        draft: `Halo, apakah "${listing.title}" masih tersedia? Boleh nego harganya?`,
      },
    });
  };

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
          , dan balas pembeli lewat{" "}
          <Link to="/chat" className="font-semibold underline">
            Chat
          </Link>
          .
        </p>
      );
    }
    if (!user) {
      return (
        <Link to="/login" state={{ from: location }} className={ctaClass}>
          Masuk untuk mengajukan penawaran
        </Link>
      );
    }
    if (!profile) {
      return (
        <Button variant="cta" className="w-full" loading>
          Memuat...
        </Button>
      );
    }
    if (!isVerified) {
      return (
        <div className="space-y-2">
          <Button variant="cta" className="w-full" disabled>
            Ajukan Penawaran
          </Button>
          <p className="rounded-lg bg-gold/40 p-3 text-sm">
            Akun Anda belum terverifikasi, jadi belum bisa menawar atau membeli
            barang.{" "}
            <Link to="/verification" className="font-semibold underline">
              Verifikasi sekarang
            </Link>
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <Button
          variant="cta"
          className="w-full"
          loading={starting}
          onClick={startChat}
        >
          {starting ? "Membuka chat..." : "Ajukan Penawaran"}
        </Button>
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <aside className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
      <p className="text-3xl font-bold">{formatRupiah(listing.price)}</p>
      <p className="text-sm text-ink/70">
        Harga bisa dinego lewat chat dengan penjual.
      </p>
      {renderAction()}
      <p className="border-t border-ink/10 pt-3 text-sm">
        Dijual oleh <span className="font-semibold">{listing.sellerName}</span>
      </p>
    </aside>
  );
}
