import { z } from 'zod'

const MAX_SIZE = 3 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export const proofSchema = z.object({
  file: z
    .any()
    .refine((files) => files?.length === 1, 'Pilih satu file')
    .refine((files) => !files?.[0] || files[0].size <= MAX_SIZE, 'Ukuran maksimal 3 MB')
    .refine(
      (files) => !files?.[0] || ALLOWED_TYPES.includes(files[0].type),
      'Format harus JPG, PNG, WEBP, atau PDF'
    ),
})