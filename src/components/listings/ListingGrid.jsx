import ListingCard from './ListingCard'
import Spinner from '../ui/Spinner'
import ErrorState from '../ui/ErrorState'
import EmptyState from '../ui/EmptyState'

const DEFAULT_GRID = 'grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5'

export default function ListingGrid({
  listings = [],
  loading,
  error,
  onRetry,
  gridClass = DEFAULT_GRID,
  emptyTitle = 'Belum ada barang',
  emptyDescription = 'Coba lagi nanti atau jadilah yang pertama menjual.',
}) {
  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  if (!Array.isArray(listings) || listings.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className={`grid ${gridClass}`}>
      {listings.map((item) => (
        <ListingCard key={item.id} listing={item} />
      ))}
    </div>
  )
}