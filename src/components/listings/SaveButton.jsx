import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useFavorite } from "../../hooks/useFavorite";

const baseClass =
  "flex w-full items-center justify-center gap-2 rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-mint/30 disabled:opacity-60";

export default function SaveButton({ listingId }) {
  const { user } = useAuth();
  const location = useLocation();
  const { saved, loading, busy, error, toggle } = useFavorite(listingId);

  if (!user) {
    return (
      <Link to="/login" state={{ from: location }} className={baseClass}>
        <Heart className="h-4 w-4" /> Simpan
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={loading || busy}
        aria-pressed={saved}
        className={baseClass}
      >
        <Heart
          className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`}
        />
        {saved ? "Tersimpan" : "Simpan"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

