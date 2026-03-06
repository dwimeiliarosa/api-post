import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

// Tipe data yang disesuaikan dengan response metadata dari backend
interface PostResponse {
  status: string;
  data: any[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalData: number;
    perPage: number; // Ditambahkan agar frontend tahu berapa data yang dikirim backend
  };
}

export const usePosts = (page: number = 1, limit?: number) => { 
  const queryClient = useQueryClient();

  // 1. Fetching Data Postingan
  const { data, isLoading } = useQuery<PostResponse>({
    // QueryKey menyertakan page dan limit agar cache tidak tumpang tindih
    queryKey: ["posts", page, limit], 
    queryFn: async () => {
      // Menggunakan URLSearchParams agar penyusunan query string lebih rapi
      const params = new URLSearchParams({
        page: page.toString(),
      });

      // Jika limit diberikan (dari swagger atau props), tambahkan ke query string
      if (limit) {
        params.append("limit", limit.toString());
      }
      
      const response = await api.get(`/posts?${params.toString()}`);
      return response.data; 
    },
  });

  // 2. Fungsi Hapus Postingan
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/posts/${id}`);
    },
    onSuccess: () => {
      // Menghapus cache lama agar UI sinkron dengan database
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      alert("Postingan berhasil dihapus! ✨");
    },
  });

  // 3. Fungsi Tambah Postingan Baru
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // 4. Fungsi Update Postingan
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string | number; formData: FormData }) => {
      const response = await api.put(`/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // 5. Fungsi Love / Toggle Favorite
  const favoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/favorites/${id}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate agar status "isFavorited" ter-update di UI
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      console.error("Gagal favorite:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        alert("Silakan login terlebih dahulu untuk menyukai produk! ❤️");
      }
    },
  });

  return {
    // Data & State
    data, 
    isLoading,
    
    // Actions (Fungsi yang dipanggil di Component)
    deletePost: deleteMutation.mutate,
    createPost: createMutation.mutate,
    updatePost: updateMutation.mutate,
    toggleFavorite: favoriteMutation.mutate,
    
    // Loading States (Untuk button loading spinner)
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isFavoriting: favoriteMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};