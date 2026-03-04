import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Sesuaikan dengan URL backend kamu
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor 1: Menambahkan Token ke setiap request
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

// Interceptor 2: Menangani jika Token Expired (401 atau 403)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Tangani Token Expired (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post('http://localhost:3000/api/refresh-token', { refreshToken });

        if (res.status === 200) {
          localStorage.setItem('accessToken', res.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 2. Tangani Akses Ditolak (403) - Perhatikan pembungkus IF status 403
    if (error.response?.status === 403) {
      // Hanya munculkan alert jika user mencoba POST/PUT/DELETE (aksi Admin)
      if (originalRequest.method !== 'get') {
        console.error("Akses ditolak: Anda bukan admin");
        alert("Maaf, hanya Admin yang bisa melakukan aksi ini! ⛔");
      }
    }

    return Promise.reject(error);
  }
);

export default api;