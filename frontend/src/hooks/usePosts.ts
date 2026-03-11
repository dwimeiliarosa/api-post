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
    perPage: number; 
  };
}

// Menambahkan searchTerm (opsional) ke parameter agar bisa digunakan untuk server-side searching
export const usePosts = (
  page: number = 1, 
  limit?: number, 
  categoryId?: string | number,
  searchTerm?: string // <-- Penambahan parameter search
) => { 
  const queryClient = useQueryClient();

  // 1. Fetching Data Postingan
  const { data, isLoading } = useQuery<PostResponse>({
    // queryKey harus menyertakan categoryId dan searchTerm agar 
    // React Query melakukan fetch ulang saat kategori atau kata kunci berubah
    queryKey: ["posts", page, limit, categoryId, searchTerm], 
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
      });

      if (limit) {
        params.append("limit", limit.toString());
      }

      // Logika Filter Kategori
      if (categoryId && categoryId !== "all") {
        params.append("category_id", categoryId.toString());
      }

      // Logika Pencarian: Kirim kata kunci ke backend jika ada
      if (searchTerm) {
        params.append("search", searchTerm);
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
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      alert("Postingan berhasil dihapus! ✨");
    },
  });

  // 3. Fungsi Tambah Postingan Baru
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log("Mengirim data ke backend:", Object.fromEntries(formData.entries()));

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
    data, 
    isLoading,
    deletePost: deleteMutation.mutate,
    createPost: createMutation.mutate,
    updatePost: updateMutation.mutate,
    toggleFavorite: favoriteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isFavoriting: favoriteMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};