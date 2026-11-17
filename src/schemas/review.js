import { z } from 'zod'

export const reviewSchema = z.object({
  rating: z
    .number({ error: 'Pilih jumlah bintang' })
    .int()
    .min(1, 'Pilih jumlah bintang')
    .max(5),
  comment: z.string().trim().max(500, 'Maksimal 500 karakter').optional(),
})

export const dealPriceSchema = z.object({
  price: z.coerce
    .number()
    .int('Harga harus bilangan bulat')
    .positive('Harga harus lebih dari 0')
    .max(1_000_000_000, 'Harga terlalu besar'),
})