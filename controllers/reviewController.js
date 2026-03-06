const pool = require('../config/db');
const { minioClient } = require('../config/minio');

/**
 * 1. TAMBAH REVIEW (SUDAH BENAR)
 * Mengambil file dari memory buffer, upload ke MinIO, lalu simpan nama file ke DB.
 */
exports.addReview = async (req, res) => {
  try {
    const { rating, comment, post_id } = req.body;
    const user_id = req.user.id;
    let image_url = null;

    if (req.file) {
      const extension = req.file.originalname.split('.').pop();
      const filename = `rev-${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;

      await minioClient.putObject(
        process.env.MINIO_BUCKET_NAME,
        filename,
        req.file.buffer,
        req.file.size,
        { 'Content-Type': req.file.mimetype }
      );

      image_url = filename;
    }

    const query = `
      INSERT INTO reviews (rating, comment, post_id, user_id, image_url, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    const values = [Number(rating), comment, Number(post_id), user_id, image_url];
    const result = await pool.query(query, values);

    res.status(201).json({ message: "Review berhasil ditambahkan", data: result.rows[0] });
  } catch (error) {
    console.error("❌ Error Backend AddReview:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 2. AMBIL REVIEW BERDASARKAN POST (SUDAH BENAR)
 * Digunakan untuk menampilkan list review di halaman detail produk.
 */
exports.getReviewsByPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const result = await pool.query(
      `SELECT r.*, u.username, u.avatar 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.post_id = $1 
       ORDER BY r.created_at DESC`,
      [post_id]
    );

    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error("❌ Error Backend GetReviews:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 3. HAPUS REVIEW (FITUR BARU)
 * Menghapus objek di MinIO (jika ada) baru kemudian menghapus baris di Database.
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params; // ID dari review
    const user_id = req.user.id; // Diambil dari middleware authenticateToken

    // 1. Cari data review dulu untuk mendapatkan nama filenya (image_url)
    const findReview = await pool.query(
      "SELECT image_url, user_id FROM reviews WHERE id = $1",
      [id]
    );

    if (findReview.rows.length === 0) {
      return res.status(404).json({ message: "Review tidak ditemukan" });
    }

    // Validasi: Pastikan yang menghapus adalah pemilik ulasan tersebut
    if (findReview.rows[0].user_id !== user_id) {
      return res.status(403).json({ message: "Anda tidak memiliki izin untuk menghapus ulasan ini" });
    }

    const imageUrl = findReview.rows[0].image_url;

    // 2. Jika review memiliki foto, hapus objeknya di MinIO
    if (imageUrl) {
      try {
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, imageUrl);
        console.log(`✅ File ${imageUrl} berhasil dihapus dari MinIO`);
      } catch (minioErr) {
        // Jika file di MinIO gagal dihapus (misal sudah terhapus manual), 
        // kita tetap lanjut hapus record di DB agar tidak berantakan.
        console.error("⚠️ Gagal hapus file di MinIO (Mungkin file sudah tidak ada):", minioErr.message);
      }
    }

    // 3. Hapus record review dari Database
    await pool.query("DELETE FROM reviews WHERE id = $1", [id]);

    res.json({ 
      status: 'success', 
      message: "Review dan foto berhasil dihapus dari sistem ✨" 
    });
  } catch (error) {
    console.error("❌ Error Backend DeleteReview:", error);
    res.status(500).json({ message: error.message });
  }
};