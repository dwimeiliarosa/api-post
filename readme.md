# API Post & Authentication System (Projek PKL)

Sistem API backend berbasis Node.js dan Express yang menyediakan fitur manajemen postingan (CRUD) dan sistem autentikasi pengguna menggunakan JWT (JSON Web Token) serta hashing password dengan Argon2.

## 🚀 Fitur Utama
- **Autentikasi**: Login, Refresh Token, dan Proteksi Profile.
- **CRUD Posts**: Pengelolaan data postingan (Judul, Isi, Gambar, File).
- **File Upload**: Mendukung upload gambar dan dokumen melalui Multer.
- **Dokumentasi API**: Terintegrasi dengan Swagger UI untuk pengujian endpoint secara interaktif.
- **Keamanan**: Implementasi Middleware JWT dan Hashing Argon2.

## 📁 Struktur Folder
Proyek ini menggunakan pola arsitektur **MVC (Model-View-Controller)** agar kode lebih terorganisir:

* **`config/`**: Konfigurasi koneksi database PostgreSQL.
* **`controllers/`**: Logika bisnis utama untuk setiap endpoint.
* **`middlewares/`**: Berisi fungsi penengah seperti autentikasi JWT dan konfigurasi upload.
* **`models/`**: Berisi query database (PostgreSQL).
* **`routes/`**: Definisi jalur API (Endpoints).
* **`utils/`**: Helper atau utilitas tambahan seperti konfigurasi Swagger.
* **`uploads/`**: Folder penyimpanan file fisik yang diunggah.

## 🛠️ Persiapan Lingkungan (Setup)

1.  **Instalasi Dependensi**:
    ```bash
    npm install
    ```

2.  **Konfigurasi Database**:
    Pastikan PostgreSQL sudah berjalan dan sesuaikan konfigurasi pada file `.env`.

3.  **Environment Variables (`.env`)**:
    Buat file `.env` dan isi dengan detail berikut:
    ```env
    DB_USER=postgres
    DB_PASSWORD=your_password
    DB_NAME=database_post
    DB_HOST=localhost
    DB_PORT=5432
    ACCESS_TOKEN_SECRET=your_secret_key
    REFRESH_TOKEN_SECRET=your_refresh_key
    ```

4.  **Menjalankan Server**:
    ```bash
    node index.js
    ```

## 📖 Dokumentasi API
Setelah server berjalan, Anda dapat mengakses dokumentasi API interaktif melalui:
`http://localhost:3000/api-docs`

## 🛡️ Keamanan
Project ini menggunakan **Argon2** untuk hashing password yang aman dan **JWT** untuk menjaga sesi pengguna tetap terproteksi.