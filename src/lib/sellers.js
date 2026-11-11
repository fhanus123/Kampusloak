import { supabase } from './supabaseClient'

export async function fetchNames(ids = []) {
  const unique = [...new Set(ids)]
  if (unique.length === 0) return {}
  const { data } = await supabase.from('public_profiles').select('id, full_name').in('id', unique)
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.full_name]))
}

export async function withSellerNames(items = []) {
  const listings = Array.isArray(items) ? items : []
  const names = await fetchNames(listings.map((item) => item.seller_id))
  return listings.map((item) => ({ ...item, sellerName: names[item.seller_id] ?? 'Penjual' }))
}