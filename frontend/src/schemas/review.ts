import * as z from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Kasih rating dulu ya!").max(5),
  comment: z.string().min(3, "Komentar terlalu pendek").max(200),
  post_id: z.number()
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;