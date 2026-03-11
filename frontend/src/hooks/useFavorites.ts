import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; 
import api from "@/api/axiosInstance";

// 1. Hook untuk mengambil DAFTAR favorit (Halaman Koleksi)
export const useMyFavorites = () => {
  return useQuery({
    queryKey: ["my-favorites"], 
    queryFn: async () => {
      try {
        const response = await api.get("/favorites/me"); 
        console.log("--- DEBUG FAVORITES ---");
        console.log("Raw Response:", response.data);
        
        // Cek apakah data ada di response.data.data atau langsung di response.data
        const actualData = response.data.data || response.data;
        
        console.log("Processed Data:", actualData);
        return actualData; 
      } catch (err) {
        console.error("API Error Favorites:", err);
        throw err;
      }
    },
  });
};

// 2. Hook untuk Tambah/Hapus favorit (Tombol Love)
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      // TAMBAHKAN /toggle/ di sini agar sesuai dengan backend
      const response = await api.post(`/favorites/toggle/${postId}`); 
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] }); 
      queryClient.invalidateQueries({ queryKey: ["my-favorites"] }); 
      console.log("✅ Favorites updated!");
    },
    onError: (error: any) => {
      console.error("❌ Toggle Favorite Error:", error.response?.data || error.message);
    }
  });
};