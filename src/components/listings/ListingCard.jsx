import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import Badge from "../ui/Badge";
import { formatRupiah, CONDITION_LABELS } from "../../lib/format";

export default function ListingCard({ listing }) {
  const {
    id,
    title,
    price,
    condition,
    image_urls,
    sellerName,
    status,
    quantity,
  } = listing;
  const image = image_urls?.[0];
  const sold = status === "sold";

  return (
    <Link
      to={`/listings/${id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-mint/20">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className={`h-full w-full object-cover ${sold ? "opacity-40 grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/30">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        {sold && (
          <span className="absolute left-2 top-2 rounded bg-ink px-2 py-1 text-xs font-bold text-white">
            Terjual
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm group-hover:text-nav-sub">
          {title}
        </h3>
        <p
          className={`text-lg font-bold ${sold ? "text-ink/50 line-through" : ""}`}
        >
          {formatRupiah(price)}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge>{CONDITION_LABELS[condition]}</Badge>
          {!sold && quantity === 1 && (
            <Badge className="bg-gold text-ink">Tersisa 1</Badge>
          )}
          {!sold && quantity > 1 && (
            <Badge className="bg-white text-ink ring-1 ring-ink/20">
              {quantity} unit
            </Badge>
          )}
        </div>
        <p className="mt-auto truncate text-xs text-ink/60">
          Dijual oleh {sellerName}
        </p>
      </div>
    </Link>
  );
}
