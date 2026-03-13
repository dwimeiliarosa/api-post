import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";
import { toast } from "sonner";

// Kita definisikan ulang Interface Comment di sini agar mendukung parent_id
// tanpa harus mencari file @/types/index.ts
export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  avatar?: string;
  isi_komentar: string;
  parent_id?: number | null; // Tambahan untuk fitur balasan
  created_at: string;
}

// Hook untuk mengambil daftar komentar
export const useComments = (postId: number) => {
  return useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      // Menggunakan /post/ sesuai dengan konfigurasi backend kamu
      const res = await api.get(`/comments/post/${postId}`);
      return res.data.data;
    },
    enabled: !!postId,
  });
};

// Hook untuk menambah komentar (SEKARANG MENDUKUNG BALASAN)
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // PERBAIKAN: Menambahkan parent_id ke dalam parameter mutationFn
    mutationFn: async (newComment: { 
      post_id: number; 
      isi_komentar: string; 
      parent_id?: number | null 
    }) => {
      const res = await api.post("/comments", newComment);
      return res.data;
    },
    onSuccess: (res) => {
      // Mengambil post_id dari response backend untuk refresh data
      const postId = res.data?.post_id;
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      // Pesan sukses otomatis ditangani di DetailPage, 
      // tapi toast di sini juga tetap aman.
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal mengirim komentar.");
    },
  });
};

// Hook untuk menghapus komentar
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