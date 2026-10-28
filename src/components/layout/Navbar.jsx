import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, User, HandCoins, ShoppingCart, MessageCircle, ChevronDown, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar({ categories }) {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (category) params.set('category', category)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <header className="bg-nav text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3 md:grid-cols-[minmax(150px,0.55fr)_minmax(280px,2fr)_auto]">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          Kampus<span className="text-cta">Loak</span>
        </Link>

        <form onSubmit={handleSearch} className="col-span-2 order-3 flex w-full overflow-hidden rounded-lg bg-white md:col-span-1 md:order-none">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Kategori"
            className="max-w-[9rem] border-r border-ink/10 bg-page px-2 text-sm text-ink outline-none"
          >
            <option value="">Semua</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari buku, laptop, perabot kos..."
            className="min-w-0 flex-1 px-3 py-2.5 text-sm text-ink outline-none"
          />
          <button type="submit" aria-label="Cari" className="bg-cta px-4 text-ink hover:brightness-95">
            <Search className="h-5 w-5" />
          </button>
        </form>

        <nav className="justify-self-end flex items-center gap-2 text-sm sm:gap-3">
          <button
            type="button"
            aria-label="Keranjang"
            title="Barang yang ditandai"
            className="rounded-full p-2 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-mint"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Chat"
            title="Chat"
            className="rounded-full p-2 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-mint"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          {user ? (
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-2 py-2 transition hover:bg-white/10 hover:text-mint [&::-webkit-details-marker]:hidden">
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden max-w-24 truncate sm:inline">{profile?.full_name?.split(' ')[0] ?? 'Akun'}</span>
                <ChevronDown className="h-4 w-4 transition duration-200 group-open:rotate-180" />
              </summary>

              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink/10 bg-white py-2 text-ink shadow-xl">
                <div className="border-b border-ink/10 px-4 pb-2 mb-1">
                  <p className="text-xs text-ink/55">Masuk sebagai</p>
                  <p className="truncate font-bold">{profile?.full_name ?? user.email}</p>
                </div>
                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-page hover:text-brand">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link to="/offers" className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-page hover:text-brand">
                  <HandCoins className="h-4 w-4" />
                  Penawaran
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-page hover:text-brand">
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </details>
          ) : (
            <Link
              to="/register"
              className="rounded-lg bg-cta px-4 py-2 font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-gold"
            >
              Daftar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}