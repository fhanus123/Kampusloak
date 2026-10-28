import { Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatRupiah, CONDITION_LABELS } from '../../lib/format'

export default function ListingCard({ listing }) {
  const { id, title, price, condition, image_urls, sellerName } = listing
  const image = image_urls?.[0]

  return (
    <Link
      to={`/listings/${id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square bg-mint/20">
        {image ? (
          <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/30">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm group-hover:text-nav-sub">{title}</h3>
        <p className="text-lg font-bold">{formatRupiah(price)}</p>
        <div>
          <Badge>{CONDITION_LABELS[condition]}</Badge>
        </div>
        <p className="mt-auto truncate text-xs text-ink/60">Dijual oleh {sellerName}</p>
      </div>
    </Link>
  )
}