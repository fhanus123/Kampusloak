export const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

export const CONDITION_LABELS = {
  new: 'Baru',
  like_new: 'Seperti baru',
  good: 'Bagus',
  fair: 'Cukup',
}