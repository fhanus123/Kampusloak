import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  ShieldCheck, HandCoins, Flag, ClipboardList, PackagePlus, X, ArrowRight,
  Laptop, BookOpen, Armchair, Shirt, Smartphone, Bike, Utensils,
  GraduationCap, LayoutGrid,
} from 'lucide-react'

const TRUST_POINTS = [
  { icon: ShieldCheck, text: 'Penjual terverifikasi mahasiswa UNSRI' },
  { icon: HandCoins, text: 'Nego harga langsung lewat penawaran' },
  { icon: Flag, text: 'Laporkan penipuan, admin menindak' },
]

const CATEGORY_ICONS = {
  laptop: Laptop,
  komputer: Laptop,
  elektronik: Smartphone,
  hp: Smartphone,
  smartphone: Smartphone,
  buku: BookOpen,
  'buku-kuliah': BookOpen,
  'alat-tulis': BookOpen,
  perabot: Armchair,
  furniture: Armchair,
  kos: Armchair,
  pakaian: Shirt,
  fashion: Shirt,
  sepeda: Bike,
  kendaraan: Bike,
  kuliner: Utensils,
  makanan: Utensils,
  kampus: GraduationCap,
}

function getCategoryIcon(category) {
  const slug = category.slug?.toLowerCase() ?? ''
  if (CATEGORY_ICONS[slug]) return CATEGORY_ICONS[slug]

  const name = category.name?.toLowerCase() ?? ''
  if (name.includes('laptop') || name.includes('komputer')) return Laptop
  if (name.includes('buku') || name.includes('kuliah')) return BookOpen
  if (name.includes('elektronik') || name.includes('hp')) return Smartphone
  if (name.includes('kos') || name.includes('perabot')) return Armchair
  if (name.includes('pakaian') || name.includes('fashion')) return Shirt
  if (name.includes('sepeda')) return Bike
  return LayoutGrid
}

export default function Home() {
  const { categories } = useOutletContext()
  const [showSellingChoices, setShowSellingChoices] = useState(false)

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-gradient-to-r from-nav-sub to-brand p-6 text-white md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">Jual beli barang bekas, aman antar mahasiswa.</h1>
        <p className="mt-2 text-sm text-white/90">Cari barang kuliah dan Kebutuhan kos dari sesama civitas UNSRI.</p>
        <button
          type="button"
          onClick={() => setShowSellingChoices(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-mint hover:shadow-lg"
        >
          Mulai jual barang
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section aria-labelledby="category-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand">Belanja berdasarkan kebutuhan</p>
            <h2 id="category-heading" className="mt-1 text-xl font-bold">Pilih kategori</h2>
          </div>
          <Link
            to="/search"
            className="text-sm font-semibold text-brand transition hover:text-nav-sub hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => {
              const CategoryIcon = getCategoryIcon(category)
              return (
                <Link
                  key={category.id}
                  to={`/search?category=${encodeURIComponent(category.slug)}`}
                  className="group flex min-h-32 flex-col items-center justify-center rounded-2xl border border-ink/8 bg-white p-4 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:border-brand/30 hover:shadow-xl"
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/35 text-brand transition duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
                    <CategoryIcon className="h-7 w-7" />
                  </div>
                  <span className="font-bold leading-tight group-hover:text-brand">{category.name}</span>
                  <span className="mt-1 text-xs text-ink/55 transition group-hover:text-ink/70">Lihat barang</span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink/20 bg-white px-4 py-8 text-center text-sm text-ink/60">
            Memuat kategori...
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {TRUST_POINTS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 rounded-xl bg-white p-4 text-sm shadow-sm">
            <Icon className="h-6 w-6 shrink-0 text-brand" />
            <span>{text}</span>
          </div>
        ))}
      </section>

      {showSellingChoices && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="selling-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowSellingChoices(false)
          }}
        >
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand">Aksi penjual</p>
                <h2 id="selling-dialog-title" className="mt-1 text-xl font-bold">Apa yang ingin Anda lakukan?</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSellingChoices(false)}
                aria-label="Tutup pilihan"
                className="rounded-full p-2 text-ink/60 transition hover:rotate-90 hover:bg-page hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to="/dashboard"
                className="group rounded-xl border border-ink/10 p-5 transition duration-300 hover:-translate-y-2 hover:border-brand/40 hover:bg-page hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mint/40 text-brand transition duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h3 className="font-bold">Lihat status</h3>
                <p className="mt-1 text-sm text-ink/65">Pantau barang dan penawaran Anda.</p>
              </Link>

              <Link
                to="/listings/new"
                className="group rounded-xl border border-ink/10 p-5 transition duration-300 hover:-translate-y-2 hover:border-cta/60 hover:bg-cta/10 hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cta/20 text-nav-sub transition duration-300 group-hover:-rotate-3 group-hover:scale-110 group-hover:bg-cta group-hover:text-ink">
                  <PackagePlus className="h-6 w-6" />
                </div>
                <h3 className="font-bold">Jual barang</h3>
                <p className="mt-1 text-sm text-ink/65">Unggah barang bekas yang siap dijual.</p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}