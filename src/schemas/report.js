import { z } from "zod";

export const reportSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Jelaskan alasan minimal 10 karakter")
    .max(500, "Maksimal 500 karakter"),
});
