// src/hooks/useFavorites.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
  // Tambahkan /favorites/ sebelum ID
  const response = await api.post(`/favorites/${postId}`); 
  return response.data;
},
   onSuccess: () => {
  // Nama queryKey harus SAMA dengan yang ada di usePosts.ts
  queryClient.invalidateQueries({ queryKey: ["posts"] }); 
  console.log("Data posts di-refresh!");
},
  });
};