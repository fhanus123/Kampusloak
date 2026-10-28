import { z } from 'zod'

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Nama minimal 3 karakter'),
    nim: z
      .string()
      .trim()
      .regex(/^\d{14}$/, 'NIM harus 14 digit angka'),
    email: z.string().trim().email('Format email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z.string().trim().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})