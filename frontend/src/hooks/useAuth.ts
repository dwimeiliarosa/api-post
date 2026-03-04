import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";
import { LoginFormValues } from "@/schemas/auth";

/**
 * HOOK: LOGIN
 * Menangani proses autentikasi dan penyimpanan token
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      const response = await api.post('/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        // Menggunakan window.location untuk hard reset state aplikasi setelah login
        window.location.href = "/dashboard";
      }
    },
    onError: (error: any) => {
      // Alert login tetap dibiarkan jika kamu belum memasang toast di halaman login
      alert(error.response?.data?.message || "Login gagal, silakan cek kembali email/password anda.");
    }
  });
};

/**
 * HOOK: GET PROFILE (useMe / useProfile)
 * Mengambil data user yang sedang login. 
 */
export const useMe = () => {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      console.log("Data User yang Dikirim ke Komponen:", res.data.user);
      return res.data.user;
    },
    enabled: !!localStorage.getItem("accessToken"),
    staleTime: 1000 * 60 * 5, 
  });
};

// Alias untuk useMe
export const useProfile = useMe;

/**
 * HOOK: UPDATE PROFILE
 * Menangani perubahan data user (username, email, dll)
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await api.put("/update-profile", updatedData);
      return res.data;
    },
    onSuccess: () => {
      // Refresh data user agar konsisten di seluruh aplikasi
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      
      // ALERT DIHAPUS agar tidak double dengan Sonner di ProfileEditPage.tsx
    },
   onError: () => {
      // ALERT DIHAPUS agar pesan error ditangani oleh Sonner di komponen
    }
  });
};