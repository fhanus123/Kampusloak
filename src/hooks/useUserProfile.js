import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { fetchNames, withSellerNames } from '../lib/sellers'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function useUserProfile(userId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false

    const load = async () => {
      if (attempt === 0) setLoading(true)
      setError('')

      if (!UUID_RE.test(userId)) {
        setData(null)
        setLoading(false)
        return
      }

      const [names, ratingRes, reviewsRes, listingsRes] = await Promise.all([
        fetchNames([userId]),
        supabase.rpc('get_user_rating', { p_user_id: userId }),
        supabase
          .from('reviews')
          .select('id, reviewer_id, rating, comment, reviewer_role, listing_title, created_at, updated_at')
          .eq('reviewee_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('listings')
          .select('id, title, price, condition, image_urls, seller_id, quantity, status, categories(name, slug)')
          .eq('seller_id', userId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      if (ignore) return
      if (ratingRes.error || reviewsRes.error || listingsRes.error) {
        setError('Gagal memuat profil pengguna.')
        setLoading(false)
        return
      }

      const name = names[userId]
      if (!name) {
        setData(null)
        setLoading(false)
        return
      }

      const reviewerNames = await fetchNames(reviewsRes.data.map((r) => r.reviewer_id))
      const listings = await withSellerNames(listingsRes.data)
      if (ignore) return

      const summary = ratingRes.data?.[0]
      setData({
        name,
        avgRating: summary?.avg_rating == null ? null : Number(summary.avg_rating),
        reviewCount: Number(summary?.review_count ?? 0),
        completedCount: Number(summary?.completed_count ?? 0),
        reviews: reviewsRes.data.map((r) => ({
          ...r,
          reviewerName: reviewerNames[r.reviewer_id] ?? 'Pengguna',
        })),
        listings,
      })
      setLoading(false)
    }

    load()
    return () => { ignore = true }
  }, [userId, attempt])

  return { data, loading, error, refetch: () => setAttempt((n) => n + 1) }
}