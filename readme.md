# API Post & Authentication System (Projek PKL)

Sistem API backend berbasis Node.js dan Express yang menyediakan fitur manajemen postingan (CRUD) dan sistem autentikasi pengguna. Proyek ini telah mengimplementasikan optimasi gambar dan sistem penyimpanan objek (Object Storage).

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan ekosistem JavaScript modern:
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Object Storage**: MinIO (S3 Compatible)
- **Image Processing**: Sharp (Resize & WebP conversion)
- **Authentication**: JWT (JSON Web Token)
- **Security**: Argon2 (Password Hashing)
- **Documentation**: Swagger UI

## 🚀 Fitur Utama
- **Autentikasi**: Login, Refresh Token, dan Proteksi Profile.
- **CRUD Posts**: Pengelolaan data postingan (Judul, Isi, Gambar, File).
- **Optimasi Gambar**: Otomatis mengubah ukuran dan format gambar ke WebP menggunakan Sharp.
- **Object Storage**: File tidak disimpan di server lokal, melainkan di MinIO dengan akses Public Read-only.
- **Dokumentasi API**: Pengujian endpoint secara interaktif melalui Swagger.

## 📁 Struktur Folder
* **`config/`**: Konfigurasi koneksi database PostgreSQL dan inisialisasi MinIO Bucket.
* **`controllers/`**: Logika bisnis utama (Auth, Posts, Category).
* **`middlewares/`**: Proteksi JWT dan konfigurasi upload Multer.
* **`routes/`**: Definisi jalur API (Endpoints).
* **`utils/`**: Helper untuk Swagger UI.

## ⚙️ Persiapan Lingkungan (Setup)

### 1. Clone Repositori
```bash
git clone [https://github.com/USERNAME_KAMU/NAMA_REPO.git](https://github.com/USERNAME_KAMU/NAMA_REPO.git)
cd api-post