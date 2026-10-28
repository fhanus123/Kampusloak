import { useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import FilterSidebar from '../components/listings/FilterSidebar'
import ListingGrid from '../components/listings/ListingGrid'
import { useSearchListings } from '../hooks/useSearchListings'

export default function Search() {
  const { categories } = useOutletContext()
  const [params, setParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const { listings, loading, error, refetch } = useSearchListings(params.toString())

  const q = params.get('q')
  const categoryName = categories.find((c) => c.slug === params.get('category'))?.name
  const title = q ? `Hasil untuk "${q}"` : categoryName ?? 'Semua barang'
  const sort = params.get('sort') ?? 'newest'

  const handleSort = (e) => {
    const next = new URLSearchParams(params)
    e.target.value === 'newest' ? next.delete('sort') : next.set('sort', e.target.value)
    setParams(next)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
        {/* key: form harga ikut ter-reset saat filter dihapus */}
        <FilterSidebar key={params.toString()} categories={categories} params={params} setParams={setParams} />
      </aside>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {!loading && !error && (
              <p className="text-sm text-ink/70">{listings.length} barang ditemukan</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-1 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filter
            </button>
            <select
              value={sort}
              onChange={handleSort}
              aria-label="Urutkan"
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="newest">Terbaru</option>
              <option value="price_asc">Harga terendah</option>
              <option value="price_desc">Harga tertinggi</option>
            </select>
          </div>
        </div>

        <ListingGrid
          listings={listings}
          loading={loading}
          error={error}
          onRetry={refetch}
          gridClass="grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
          emptyTitle="Barang tidak ditemukan"
          emptyDescription="Coba kata kunci lain atau hapus sebagian filter."
        />
      </section>
    </div>
  )
}