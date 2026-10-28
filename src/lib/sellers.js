import { supabase } from './supabaseClient'

export async function withSellerNames(items = []) {
  const listings = Array.isArray(items) ? items : []
  const ids = [...new Set(listings.map((item) => item.seller_id))]
  if (ids.length === 0) return listings

  const { data } = await supabase
    .from('public_profiles')
    .select('id, full_name')
    .in('id', ids)

  const names = Object.fromEntries((data ?? []).map((s) => [s.id, s.full_name]))
  return listings.map((item) => ({ ...item, sellerName: names[item.seller_id] ?? 'Penjual' }))
}