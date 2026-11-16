import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { withSellerNames } from '../lib/sellers'
import { watchRealtime } from '../lib/watchRealtime'

export function useListings({ limit = 20 } = {}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    let hasLoaded = false
    let request = 0

    const loadListings = async () => {
      const currentRequest = ++request
      if (!hasLoaded) setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('listings')
        .select('id, title, price, quantity, condition, image_urls, seller_id, categories(name, slug)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (ignore || currentRequest !== request) return

      if (queryError) {
        setListings([])
        setError('Gagal memuat daftar barang.')
        setLoading(false)
        hasLoaded = true
        return
      }

      const listingsWithSellerNames = await withSellerNames(data ?? [])
      if (ignore || currentRequest !== request) return
      setListings(listingsWithSellerNames)
      setLoading(false)
      hasLoaded = true
    }

    loadListings()
    const stopWatching = watchRealtime(
      'catalog:listings',
      [{ table: 'listings' }, { table: 'categories' }],
      loadListings,
    )
    return () => {
      ignore = true
      stopWatching()
    }
  }, [limit, attempt])

  return { listings, loading, error, refetch: () => setAttempt((value) => value + 1) }
}

export function useListingDetail(id) {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    let hasLoaded = false
    let request = 0
    const numericId = Number(id)

    const load = async () => {
      const currentRequest = ++request
      if (!hasLoaded) setLoading(true)
      setError('')

      if (!Number.isInteger(numericId)) {
        setListing(null)
        setLoading(false)
        hasLoaded = true
        return
      }

      const { data, error: queryError } = await supabase
        .from('listings')
        .select('*, categories(name, slug)')
        .eq('id', numericId)
        .maybeSingle()

      if (ignore || currentRequest !== request) return
      if (queryError) {
        setError('Gagal memuat barang.')
        setLoading(false)
        hasLoaded = true
        return
      }
      if (!data) {
        setListing(null)
        setLoading(false)
        hasLoaded = true
        return
      }

      const [withName] = await withSellerNames([data])
      if (ignore || currentRequest !== request) return
      setListing(withName)
      setLoading(false)
      hasLoaded = true
    }

    load()
    const stopWatching = watchRealtime(
      `listing-detail:${id}`,
      [
        { table: 'listings', filter: `id=eq.${numericId}` },
        { table: 'categories' },
      ],
      load,
    )
    return () => {
      ignore = true
      stopWatching()
    }
  }, [id, attempt])

  return { listing, loading, error, refetch: () => setAttempt((value) => value + 1) }
}

export const useListing = useListingDetail