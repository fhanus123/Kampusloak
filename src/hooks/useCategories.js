import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { watchRealtime } from '../lib/watchRealtime'

export function useCategories() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    let ignore = false
    const load = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name')
      if (ignore) return
      setCategories(data ?? [])
    }
    load()
    const stopWatching = watchRealtime('categories', [{ table: 'categories' }], load)
    return () => {
      ignore = true
      stopWatching()
    }
  }, [])

  return categories
}