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
      // Mengirim kredensial ke endpoint login
      const response = await api.post('/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // PERBAIKAN: Memastikan token ada sebelum disimpan
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        
        // PERBAIKAN: Menggunakan replace agar history login dibersihkan 
        // dan memaksa aplikasi memuat state baru di Dashboard
        window.location.replace("/dashboard");
      }
    },
    onError: (error: any) => {
      // Menampilkan pesan error spesifik dari backend jika tersedia
      const message = error.response?.data?.message || "Login gagal, silakan cek kembali email/password anda.";
      alert(message);
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
    // Hanya berjalan jika ada token di storage
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