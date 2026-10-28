import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { withSellerNames } from '../lib/sellers'

export function useListings({ limit = 20 } = {}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false

    const loadListings = async () => {
      setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('listings')
        .select('id, title, price, condition, image_urls, seller_id, categories(name, slug)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (ignore) return

      if (queryError) {
        setListings([])
        setError('Gagal memuat daftar barang.')
        setLoading(false)
        return
      }

      const listingsWithSellerNames = await withSellerNames(data ?? [])
      if (ignore) return
      setListings(listingsWithSellerNames)
      setLoading(false)
    }

    loadListings()
    return () => { ignore = true }
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

    const load = async () => {
      setLoading(true)
      setError('')

      const numericId = Number(id)
      if (!Number.isInteger(numericId)) {
        setListing(null)
        setLoading(false)
        return
      }

      const { data, error: queryError } = await supabase
        .from('listings')
        .select('*, categories(name, slug)')
        .eq('id', numericId)
        .maybeSingle()

      if (ignore) return
      if (queryError) {
        setError('Gagal memuat barang.')
        setLoading(false)
        return
      }
      if (!data) {
        setListing(null)
        setLoading(false)
        return
      }

      const [withName] = await withSellerNames([data])
      if (ignore) return
      setListing(withName)
      setLoading(false)
    }

    load()
    return () => { ignore = true }
  }, [id, attempt])

  return { listing, loading, error, refetch: () => setAttempt((value) => value + 1) }
}

export const useListing = useListingDetail