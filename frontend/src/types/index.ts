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
}

export interface AuthResponse {
  status: string;
  accessToken: string;
  refreshToken: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  avatar?: string; // Tambahkan baris ini
  isi_komentar: string;
  created_at: string;
}