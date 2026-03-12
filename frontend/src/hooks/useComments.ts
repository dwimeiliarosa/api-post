import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";
import { toast } from "sonner";
import { Comment } from "@/types";

// Hook untuk mengambil daftar komentar
export const useComments = (postId: number) => {
  return useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      // PERBAIKAN: Menggunakan /post/ bukan /product/ sesuai commentRoutes.js
      const res = await api.get(`/comments/post/${postId}`);
      return res.data.data;
    },
    enabled: !!postId,
  });
};

// Hook untuk menambah komentar
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newComment: { post_id: number; isi_komentar: string }) => {
      const res = await api.post("/comments", newComment);
      return res.data;
    },
    onSuccess: (res) => {
      // Mengambil post_id dari response backend untuk refresh data secara spesifik
      const postId = res.data?.post_id;
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Komentar berhasil dikirim! 💬✨");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal mengirim komentar.");
    },
  });
};

// Hook untuk menghapus komentar (DIBUTUHKAN OLEH DetailPage.tsx)
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, post_id }: { id: number; post_id: number }) => {
      await api.delete(`/comments/${id}`);
      return post_id;
    },
    onSuccess: (post_id) => {
      queryClient.invalidateQueries({ queryKey: ["comments", post_id] });
      toast.success("Komentar telah dihapus.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menghapus komentar.");
    },
  });
};