import { z } from "zod";

export const normalizePhone = (value) => {
  const digits = value.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+62")) return digits.slice(1);
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
};

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Nomor HP wajib diisi")
  .transform(normalizePhone)
  .refine(
    (v) => /^628[1-9][0-9]{7,11}$/.test(v),
    "Nomor HP tidak valid, contoh: 081234567890",
  );

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Nama minimal 3 karakter"),
    nim: z
      .string()
      .trim()
      .regex(/^\d{14}$/, "NIM harus 14 digit angka"),
    phone: phoneSchema,
    email: z.string().trim().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const forgotSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
});

export const resetSchema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });
