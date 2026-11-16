import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { withSellerNames } from '../lib/sellers'
import { watchRealtime } from '../lib/watchRealtime'

const SORTS = {
  newest: { column: 'created_at', ascending: false },
  price_asc: { column: 'price', ascending: true },
  price_desc: { column: 'price', ascending: false },
}

export function useSearchListings(searchString) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    let hasLoaded = false
    let request = 0

    const load = async () => {
      const currentRequest = ++request
      if (!hasLoaded) setLoading(true)
      setError('')

      const p = new URLSearchParams(searchString)
      let query = supabase
        .from('listings')
        .select('id, title, price, quantity, condition, image_urls, seller_id, categories!inner(name, slug)')
        .eq('status', 'approved')

      const q = p.get('q')?.replace(/[%,()]/g, ' ').trim()
      if (q) query = query.ilike('title', `%${q}%`)

      const category = p.get('category')
      if (category) query = query.eq('categories.slug', category)

      const conditions = p.getAll('condition')
      if (conditions.length > 0) query = query.in('condition', conditions)

      const min = p.get('min')
      const max = p.get('max')
      if (min && Number(min) >= 0) query = query.gte('price', Number(min))
      if (max && Number(max) >= 0) query = query.lte('price', Number(max))

      const sort = SORTS[p.get('sort')] ?? SORTS.newest
      const { data, error: queryError } = await query
        .order(sort.column, { ascending: sort.ascending })
        .limit(40)

      if (ignore || currentRequest !== request) return
      if (queryError) {
        setError('Gagal memuat hasil pencarian.')
        setLoading(false)
        hasLoaded = true
        return
      }

      const result = await withSellerNames(data)
      if (ignore || currentRequest !== request) return
      setListings(result)
      setLoading(false)
      hasLoaded = true
    }

    load()
    const stopWatching = watchRealtime(
      'search:listings',
      [{ table: 'listings' }, { table: 'categories' }],
      load,
    )
    return () => {
      ignore = true
      stopWatching()
    }
  }, [searchString, attempt])

  return { listings, loading, error, refetch: () => setAttempt((n) => n + 1) }
}