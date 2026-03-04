// src/api/axios.ts
import axios from 'axios';
import { toast } from 'sonner'; // 1. Tambahkan import sonner

const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Tangani Token Expired (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post('http://localhost:3000/api/auth/refresh', { refreshToken });

        if (res.status === 200) {
          const newToken = res.data.accessToken || res.data.data?.accessToken;
          localStorage.setItem('accessToken', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
  // Ganti console.error dengan toast yang informatif
  toast.error("Sesi Anda telah berakhir. Silakan login kembali untuk keamanan.", {
    duration: 5000, // Beri waktu 5 detik biar user sempat baca
  });
  
  localStorage.clear();
  // Kasih delay dikit biar user sempat baca toast-nya
  setTimeout(() => {
    window.location.href = '/login';
  }, 2000);
  
  return Promise.reject(refreshError);
}
    }

    // 2. Tangani Akses Ditolak (403) - SUDAH DISESUAIKAN
    if (error.response?.status === 403) {
      if (originalRequest.method !== 'get') {
        // Ganti alert dengan toast.error agar UI konsisten
        toast.error("Maaf, hanya Admin yang bisa melakukan aksi ini! ⛔");
        console.error("Akses ditolak: Anda bukan admin");
      }
    }

    return Promise.reject(error);
  }
);

export default api;