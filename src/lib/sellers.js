import { supabase } from './supabaseClient'

export async function fetchNames(ids = []) {
  const unique = [...new Set(ids)].filter(Boolean)
  if (unique.length === 0) return {}
  const { data } = await supabase.rpc('get_public_names', { p_ids: unique })
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.full_name]))
}

export async function withSellerNames(items = []) {
  const listings = Array.isArray(items) ? items : []
  const names = await fetchNames(listings.map((item) => item.seller_id))
  return listings.map((item) => ({ ...item, sellerName: names[item.seller_id] ?? 'Penjual' }))
}