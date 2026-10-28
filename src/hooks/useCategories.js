import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useCategories() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name')
      setCategories(data ?? [])
    }
    load()
  }, [])

  return categories
}