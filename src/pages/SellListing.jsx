import { PackagePlus } from 'lucide-react'

export default function SellListing() {
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
      <p className="text-sm text-ink/70">
        Formulir unggah barang akan segera tersedia di sini.
      </p>
    </section>
  )
}
