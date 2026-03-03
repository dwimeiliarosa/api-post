import { useQuery } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories"); // Sesuaikan dengan endpoint Swagger
      return res.data;
    },
  });
};