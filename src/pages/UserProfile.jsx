import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgeCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import ListingGrid from '../components/listings/ListingGrid'
import ReviewItem from '../components/reviews/ReviewItem'
import StarRating from '../components/reviews/StarRating'
import Spinner from '../components/ui/Spinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'buyer', label: 'Dari pembeli' },
  { value: 'seller', label: 'Dari penjual' },
]

export default function UserProfile() {
  const { id } = useParams()
  return <ProfileView key={id} userId={id} />
}

function ProfileView({ userId }) {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useUserProfile(userId)
  const [filter, setFilter] = useState('all')

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data) {
    return (
      <EmptyState
        title="Pengguna tidak ditemukan"
        description="Profil ini tidak ada atau tautannya salah."
      />
    )
  }

  const isMe = user?.id === userId
  const { name, avgRating, reviewCount, completedCount, reviews, listings } = data
  const shown = filter === 'all' ? reviews : reviews.filter((r) => r.reviewer_role === filter)

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center gap-5 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-nav-sub text-2xl font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="truncate text-2xl font-bold">{name}</h1>
          {isMe && (
            <p className="text-xs font-semibold text-nav-sub">
              Ini profil Anda ·{' '}
              <Link to="/dashboard" className="underline">
                Kelola barang
              </Link>
            </p>
          )}
          {reviewCount > 0 ? (
            <div className="flex items-center gap-2">
              <StarRating value={Math.round(avgRating)} size="h-5 w-5" />
              <span className="font-bold">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-ink/70">({reviewCount} ulasan)</span>
            </div>
          ) : (
            <p className="text-sm text-ink/70">Belum ada ulasan.</p>
          )}
          <p className="flex items-center gap-1 text-sm text-ink/70">
            <BadgeCheck className="h-4 w-4 text-nav-sub" />
            {completedCount} transaksi selesai
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Ulasan</h2>
          <div className="flex gap-2" role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  filter === f.value ? 'bg-nav-sub text-white' : 'bg-white hover:bg-mint/30'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <EmptyState title="Belum ada ulasan" description="Ulasan muncul setelah transaksi selesai." />
        ) : (
          <ul className="space-y-3">
            {shown.map((r) => (
              <ReviewItem key={r.id} review={r} onChanged={refetch} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Barang yang sedang dijual</h2>
        <ListingGrid
          listings={listings}
          loading={false}
          error=""
          emptyTitle="Tidak ada barang tayang"
          emptyDescription={`${name} belum menjual barang saat ini.`}
        />
      </section>

      <Link to="/" className="inline-block text-sm font-semibold text-nav-sub underline">Kembali ke beranda</Link>
    </div>
  )
}