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
      // Menggunakan notifikasi standar jika belum ada Toast di login
      alert(error.response?.data?.message || "Login gagal, silakan cek kembali email/password anda.");
    }
  });
};

/**
 * HOOK: GET PROFILE (useMe)
 * Mengambil data user yang sedang login termasuk skin_type.
 * Komponen DetailPage akan memanggil data 'user' dari sini.
 */
export const useMe = () => {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      // Memastikan data user yang dikirim memiliki properti skin_type
      console.log("Data User Profile:", res.data.user);
      return res.data.user;
    },
    enabled: !!localStorage.getItem("accessToken"),
    staleTime: 1000 * 60 * 5, // Cache selama 5 menit
  });
};

/**
 * HOOK: useAuth
 * Ini adalah 'jembatan' utama untuk komponen DetailPage.tsx
 * Menyatukan data profile agar mudah dipanggil sebagai 'user'.
 */
export const useAuth = () => {
  const { data: user, isLoading, error } = useMe();
  
  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
};

// Alias untuk fleksibilitas
export const useProfile = useMe;

/**
 * HOOK: UPDATE PROFILE
 * Menangani perubahan data user (username, email, skin_type, dll)
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await api.put("/update-profile", updatedData);
      return res.data;
    },
    onSuccess: () => {
      // Refresh data user agar konsisten di seluruh aplikasi (Glow-Check terupdate)
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    },
    onError: (error: any) => {
       console.error("Gagal update profil:", error);
    }
  });
};