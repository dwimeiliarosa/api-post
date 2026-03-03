import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

export const usePosts = () => {
  const queryClient = useQueryClient();

  // 1. Ambil data postingan
  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await api.get("/posts");
      return response.data.data || response.data;
    },
  });

  // 2. Fungsi Hapus
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      alert("Postingan berhasil dihapus!");
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
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
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
    // UBAH ALAMATNYA DI SINI
    // Sesuaikan dengan router.post('/favorites/:id') di backend kamu
    const response = await api.post(`/favorites/${id}`);
    return response.data;
  },
  onSuccess: () => {
    // Refresh data agar icon heart berubah warna
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  },
  onError: (error: any) => {
    console.error("Gagal favorite:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      alert("Silakan login terlebih dahulu!");
    }
  }
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
    isFavoriting: favoriteMutation.isPending 
  };
};