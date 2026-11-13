import { z } from "zod";

export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter")
    .max(100, "Judul maksimal 100 karakter"),
  description: z.string().trim().max(1000, "Maksimal 1000 karakter").optional(),
  categoryId: z.coerce.number().int().positive("Pilih kategori"),
  price: z.coerce
    .number()
    .int("Harga harus bilangan bulat")
    .min(0, "Harga tidak boleh negatif")
    .max(1_000_000_000, "Harga terlalu besar"),
  quantity: z.coerce
    .number()
    .int("Jumlah harus bilangan bulat")
    .min(1, "Minimal 1 unit")
    .max(99, "Maksimal 99 unit"),
  condition: z.enum(["new", "like_new", "good", "fair"]),
});

export const IMAGE_RULES = {
  maxCount: 5,
  maxSize: 2 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp"],
};
