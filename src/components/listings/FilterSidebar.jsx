import { useState } from 'react'
import Button from '../ui/Button'
import { CONDITION_LABELS } from '../../lib/format'

export default function FilterSidebar({ categories, params, setParams }) {
  const [min, setMin] = useState(params.get('min') ?? '')
  const [max, setMax] = useState(params.get('max') ?? '')

  const selectedCategory = params.get('category') ?? ''
  const selectedConditions = params.getAll('condition')

  const update = (mutate) => {
    const next = new URLSearchParams(params)
    mutate(next)
    setParams(next)
  }

  const setCategory = (slug) =>
    update((next) => (slug ? next.set('category', slug) : next.delete('category')))

  const toggleCondition = (value) =>
    update((next) => {
      const current = next.getAll('condition')
      const list = current.includes(value)
        ? current.filter((c) => c !== value)
        : [...current, value]
      next.delete('condition')
      list.forEach((c) => next.append('condition', c))
    })

  const applyPrice = (e) => {
    e.preventDefault()
    let low = min
    let high = max
    if (low && high && Number(low) > Number(high)) [low, high] = [high, low]
    update((next) => {
      low ? next.set('min', low) : next.delete('min')
      high ? next.set('max', high) : next.delete('max')
    })
  }

  const hasFilter = [...params.keys()].some((k) => k !== 'q' && k !== 'sort')
  const resetFilters = () =>
    update((next) => {
      ;['category', 'condition', 'min', 'max'].forEach((k) => next.delete(k))
    })

  return (
    <div className="space-y-6 rounded-xl bg-white p-4 text-sm shadow-sm">
      <section>
        <h3 className="mb-2 font-bold">Kategori</h3>
        <ul className="space-y-1">
          <li>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="radio" name="category" checked={selectedCategory === ''} onChange={() => setCategory('')} className="accent-brand" />
              Semua kategori
            </label>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="radio" name="category" checked={selectedCategory === c.slug} onChange={() => setCategory(c.slug)} className="accent-brand" />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 font-bold">Kondisi</h3>
        <ul className="space-y-1">
          {Object.entries(CONDITION_LABELS).map(([value, label]) => (
            <li key={value}>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={selectedConditions.includes(value)} onChange={() => toggleCondition(value)} className="accent-brand" />
                {label}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={applyPrice}>
        <h3 className="mb-2 font-bold">Harga (Rp)</h3>
        <div className="flex items-center gap-2">
          <input type="number" min="0" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} placeholder="Min" aria-label="Harga minimum" className="w-full rounded-lg border border-ink/20 px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand" />
          <span>-</span>
          <input type="number" min="0" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} placeholder="Maks" aria-label="Harga maksimum" className="w-full rounded-lg border border-ink/20 px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand" />
        </div>
        <Button type="submit" variant="outline" className="mt-2 w-full">Terapkan</Button>
      </form>

      {hasFilter && (
        <button onClick={resetFilters} className="font-semibold text-nav-sub underline">
          Hapus semua filter
        </button>
      )}
    </div>
  )
}