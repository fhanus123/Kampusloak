import { Link, useParams } from 'react-router-dom'
import ImageGallery from './ImageGallery'
import BuyBox from './BuyBox'
import Badge from '../ui/Badge'
import Spinner from '../ui/Spinner'
import ErrorState from '../ui/ErrorState'
import EmptyState from '../ui/EmptyState'
import { useListingDetail } from '../../hooks/useListings'
import { CONDITION_LABELS } from '../../lib/format'

export default function ListingDetail() {
  const { id } = useParams()
  const { listing, loading, error, refetch } = useListingDetail(id)

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!listing) {
    return <EmptyState title="Barang tidak ditemukan" description="Barang mungkin sudah dihapus atau belum disetujui." />
  }

  const { title, description, condition, image_urls, categories } = listing

  return (
    <div className="space-y-4">
      <nav className="text-sm text-ink/70">
        <Link to="/" className="hover:underline">Beranda</Link>
        {' / '}
        <Link to={`/search?category=${categories?.slug}`} className="hover:underline">{categories?.name}</Link>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_320px]">
        <ImageGallery images={image_urls} title={title} />

        <section className="space-y-3">
          <h1 className="text-2xl font-bold">{title}</h1>
          <Badge>{CONDITION_LABELS[condition]}</Badge>
          <div className="border-t border-ink/10 pt-3">
            <h2 className="mb-1 font-bold">Deskripsi</h2>
            <p className="whitespace-pre-line text-sm">{description || 'Penjual tidak menambahkan deskripsi.'}</p>
          </div>
        </section>

        <BuyBox listing={listing} />
      </div>
    </div>
  )
}