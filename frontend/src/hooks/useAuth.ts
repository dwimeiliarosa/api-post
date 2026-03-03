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
      alert(error.response?.data?.message || "Login gagal, silakan cek kembali email/password anda.");
    }
  });
};

/**
 * HOOK: GET PROFILE (useMe / useProfile)
 * Mengambil data user yang sedang login. 
 * Kita gunakan queryKey ["auth-me"] agar konsisten di seluruh aplikasi.
 */
export const useMe = () => {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      // Sesuai log console kamu: data berada di res.data.user
      console.log("Data User yang Dikirim ke Komponen:", res.data.user);
      return res.data.user;
    },
    // Hanya fetch jika token ada di localStorage
    enabled: !!localStorage.getItem("accessToken"),
    // Menghindari fetch berulang jika data belum dianggap 'basi' (stale)
    staleTime: 1000 * 60 * 5, 
  });
};

// Alias untuk useMe jika kamu lebih suka menyebutnya useProfile
export const useProfile = useMe;

/**
 * HOOK: UPDATE PROFILE
 * Menangani perubahan data user (username, email, dll)
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedData: any) => {
      // HAPUS '/auth' agar sesuai dengan app.use('/api', authRoutes) di index.js
      const res = await api.put("/update-profile", updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      alert("Profile updated successfully! ✨");
    },
    onError: (error: any) => {
       alert(error.response?.data?.message || "Gagal update profile");
    }
  });
};