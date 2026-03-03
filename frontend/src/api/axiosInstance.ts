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

    // Jika error 403 (Forbidden) dan belum pernah dicoba refresh
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        // Panggil endpoint refresh-token milikmu
        const res = await axios.post('http://localhost:3000/api/refresh-token', {
          refreshToken,
        });

        if (res.status === 200) {
          localStorage.setItem('accessToken', res.data.accessToken);
          // Ulangi request yang gagal tadi dengan token baru
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Jika refresh token juga gagal/expired, paksa login ulang
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;