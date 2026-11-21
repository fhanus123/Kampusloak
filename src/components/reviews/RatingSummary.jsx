import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import StarRating from './StarRating'
import ErrorState from '../ui/ErrorState'

export default function RatingSummary() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false

    const load = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        const { data, error: rpcError } = await supabase.rpc('get_user_rating', {
          p_user_id: user.id,
        })
        if (ignore) return
        if (rpcError) {
          setError('Gagal memuat reputasi.')
        } else {
          setSummary(data?.[0] ?? { avg_rating: null, review_count: 0 })
        }
      } catch {
        if (!ignore) setError('Gagal memuat reputasi.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [user?.id, attempt])

  if (loading) {
    return <p role="status" className="text-sm text-ink/70">Memuat reputasi...</p>
  }
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => setAttempt((current) => current + 1)}
      />
    )
  }
  if (!user) return null

  const count = Number(summary?.review_count ?? 0)
  const avg = summary?.avg_rating == null ? null : Number(summary.avg_rating)

  return (
    <Link
      to={`/users/${user.id}`}
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow-sm hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div>
        <p className="text-sm font-semibold text-ink/70">Reputasi Anda</p>
        {count > 0 && avg !== null ? (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avg)} size="h-5 w-5" />
            <span className="font-bold">{avg.toFixed(1)}</span>
            <span className="text-sm text-ink/70">({count} ulasan)</span>
          </div>
        ) : (
          <p className="text-sm">
            Belum ada ulasan. Selesaikan transaksi untuk mendapatkannya.
          </p>
        )}
      </div>
      <span className="link-action inline-flex items-center gap-1 text-sm">
        Lihat semua ulasan
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </span>
    </Link>
  )
}
