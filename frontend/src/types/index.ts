export interface Category {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  judul: string;
  isi: string;
  gambar: string; // URL dari MinIO
  file: string;   // URL dari MinIO
  category_id: number;
  category_name?: string;
  suitable_for?: string; // Digunakan untuk filter skin type
  rating?: number;
  total_favorites?: number;
}

// 1. Tambahkan Interface User untuk keperluan Auth & Role Checking
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | string; // Memastikan role tersedia untuk pengecekan admin
  skin_type?: string;              // Tambahan untuk profil GlowUp
  avatar?: string;
}

// 2. Tambahkan Interface Review untuk fitur ulasan
export interface Review {
  id: number;
  post_id: number;
  user_id: number;   // Wajib ada untuk mencocokkan kepemilikan (tombol hapus)
  username: string;
  rating: number;    // ⭐ 1-5
  comment: string;
  image_url?: string; // URL foto review jika ada
  created_at: string;
}

export interface AuthResponse {
  status: string;
  accessToken: string;
  refreshToken: string;
  user?: User; // Tambahkan ini jika API menyertakan data user saat login
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  avatar?: string;
  isi_komentar: string;
  created_at: string;
  parent_id?: number | null; // WAJIB UNTUK FITUR BALASAN
  replies?: Comment[];       // Untuk data nested dari backend
}

// Interface untuk mendukung fitur notifikasi
export interface Notification {
  id: number;
  user_id: number;
  type: 'reply' | 'review' | 'info'; 
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}