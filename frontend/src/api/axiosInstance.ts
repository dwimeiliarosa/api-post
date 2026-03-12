// src/api/axios.ts
import axios from 'axios';
import { toast } from 'sonner';

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
        // PERBAIKAN: Mengarahkan ke endpoint refresh yang tepat dan mengambil data secara konsisten
        const res = await axios.post('http://localhost:3000/api/auth/refresh', { refreshToken });

        if (res.status === 200) {
          // PERBAIKAN: Mengambil accessToken langsung dari res.data sesuai saran sebelumnya
          const newToken = res.data.accessToken; 
          
          if (newToken) {
            localStorage.setItem('accessToken', newToken);
            
            // Update header untuk request yang sedang berjalan dan request selanjutnya
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Notifikasi sesi berakhir
        toast.error("Sesi Anda telah berakhir. Silakan login kembali untuk keamanan.", {
          duration: 5000,
        });
        
        localStorage.clear();
        
        // Delay 2 detik agar user sempat membaca pesan toast
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        
        return Promise.reject(refreshError);
      }
    }

    // 2. Tangani Akses Ditolak (403)
    if (error.response?.status === 403) {
      if (originalRequest.method !== 'get') {
        toast.error("Maaf, hanya Admin yang bisa melakukan aksi ini! ⛔");
        console.error("Akses ditolak: Anda bukan admin");
      }
    }

    return Promise.reject(error);
  }
);

export default api;