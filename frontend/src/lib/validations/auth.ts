import * as z from "zod";

/**
 * Validasi untuk Halaman Login
 */
export const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Validasi untuk Halaman Register
 */
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username minimal 3 karakter" })
    .max(20, { message: "Username maksimal 20 karakter" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username hanya boleh huruf, angka, atau underscore" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;