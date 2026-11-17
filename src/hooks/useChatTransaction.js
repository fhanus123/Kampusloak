import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

export function useChatTransaction(listingId, buyerId) {
  const { user } = useAuth()
  const [transaction, setTransaction] = useState(null)
  const [myReview, setMyReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')

    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('id, status, price, listing_title, seller_id, buyer_id')
      .eq('listing_id', listingId)
      .eq('buyer_id', buyerId)
      .neq('status', 'cancelled')
      .maybeSingle()

    if (txError) {
      setError('Gagal memuat status transaksi.')
      setLoading(false)
      return
    }

    let review = null
    if (tx?.status === 'completed') {
      const { data } = await supabase
        .from('reviews')
        .select('id, rating, comment')
        .eq('transaction_id', tx.id)
        .eq('reviewer_id', user.id)
        .maybeSingle()
      review = data
    }

    setTransaction(tx)
    setMyReview(review)
    setLoading(false)
  }, [listingId, buyerId, user.id])

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0)
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

  return { transaction, myReview, loading, error, refetch: load }
}