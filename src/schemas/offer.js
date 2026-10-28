import { z } from 'zod'

export const offerSchema = z.object({
  amount: z.coerce
    .number()
    .int('Nominal harus bilangan bulat')
    .positive('Nominal harus lebih dari 0')
    .max(1_000_000_000, 'Nominal terlalu besar'),
  message: z.string().trim().max(300, 'Maksimal 300 karakter').optional(),
})