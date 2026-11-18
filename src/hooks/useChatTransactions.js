import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

export function useChatTransactions(listingId, buyerId) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [reviews, setReviews] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (silent = false) => {
    if (!listingId || !buyerId) {
      setLoading(false)
      return
    }
    if (!silent) setLoading(true)
    setError('')

    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('id, status, price, listing_title, seller_id, buyer_id, seller_banner_hidden, buyer_banner_hidden, created_at')
      .eq('listing_id', listingId)
      .eq('buyer_id', buyerId)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })

    if (txError) {
      setError('Gagal memuat status transaksi.')
      setLoading(false)
      return
    }

    const completedIds = (txs ?? []).filter((t) => t.status === 'completed').map((t) => t.id)
    let map = {}
    if (completedIds.length > 0) {
      const { data: revs } = await supabase
        .from('reviews')
        .select('id, transaction_id, rating, comment')
        .in('transaction_id', completedIds)
        .eq('reviewer_id', user.id)
      map = Object.fromEntries((revs ?? []).map((r) => [r.transaction_id, r]))
    }

    setTransactions(txs ?? [])
    setReviews(map)
    setLoading(false)
  }, [listingId, buyerId, user.id])

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0)
    if (!listingId || !buyerId) return () => window.clearTimeout(timer)
    const channel = supabase
      .channel(`tx:${listingId}:${buyerId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `listing_id=eq.${listingId}` },
        () => load(true)
      )
      .subscribe()
    return () => {
      window.clearTimeout(timer)
      supabase.removeChannel(channel)
    }
  }, [load, listingId, buyerId])

  const hasPending = transactions.some((t) => t.status === 'pending')

  return { transactions, reviews, hasPending, loading, error, refetch: load }
}
