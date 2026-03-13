import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

// Definisi Interface untuk data Notifikasi agar terstruktur
export interface Notification {
  id: number;
  user_id: number;
  sender_id: number;
  sender_name?: string;   // Nama pengirim (misal: user yang memberi ulasan)
  post_id: number;        // Digunakan untuk navigasi ke produk terkait
  title: string;
  message: string;
  is_read: boolean;
  type: 'reply' | 'review' | 'system'; 
  created_at: string;
}

/**
 * 1. AMBIL SEMUA DATA NOTIFIKASI
 * Mengambil list notifikasi milik user yang sedang login.
 */
export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications");
      // Sesuai struktur backend: res.data.data
      return res.data.data;
    },
    refetchInterval: 30000, // Cek data baru secara otomatis setiap 30 detik
  });
};

/**
 * 2. HITUNG JUMLAH NOTIFIKASI BELUM DIBACA
 * Berguna untuk menampilkan angka (badge) di ikon lonceng Navbar.
 */
export const useUnreadNotifications = () => {
  const { data: notifications } = useNotifications();
  return notifications?.filter(n => !n.is_read).length || 0;
};

/**
 * 3. MENANDAI SATU NOTIFIKASI SEBAGAI DIBACA
 * Dipanggil saat user mengklik salah satu notifikasi.
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      // Refresh data agar status is_read berubah di UI
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

/**
 * 4. MENANDAI SEMUA NOTIFIKASI SEBAGAI DIBACA
 * Berguna untuk tombol "Tandai semua telah dibaca" di NotificationPage.
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.put("/notifications/read-all");
    },
    onSuccess: () => {
      // Paksa refresh data agar semua notifikasi terlihat sudah dibaca
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};