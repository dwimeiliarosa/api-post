import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";
import { toast } from "sonner";

// 1. Hook untuk mengambil daftar review berdasarkan ID Post
export const useReviews = (postId: number) => {
  return useQuery({
    queryKey: ["reviews", postId],
    queryFn: async () => {
      /** * PERBAIKAN: Menggunakan endpoint /product/${postId} 
       * agar tidak bentrok dengan endpoint DELETE /reviews/:id
       */
      const res = await api.get(`/reviews/product/${postId}`);
      
      // Mengambil data dari struktur standar response { status: 'success', data: [...] }
      return res.data.data;
    },
    enabled: !!postId, // Hanya jalan jika postId tersedia
  });
};

// 2. Hook untuk menambahkan review baru (dengan dukungan FormData untuk Foto)
export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Axios secara otomatis menangani boundary untuk multipart/form-data
      const res = await api.post("/reviews", formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      });
      return res.data;
    },
    onSuccess: (data) => {
      // Invalidate query agar daftar ulasan langsung terupdate tanpa reload
      // Kita gunakan postId dari data yang baru dibuat jika tersedia
      const postId = data.data?.post_id;
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["reviews", postId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      }
      
      toast.success("Review & Foto berhasil diunggah! 📸✨");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Gagal mengirim review.";
      toast.error(errorMessage);
      console.error("Review Error:", error);
    }
  });
};