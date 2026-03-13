const pool = require('../config/db');
const { minioClient } = require('../config/minio');

/**
 * 1. TAMBAH REVIEW (DIPERBAIKI DENGAN NOTIFIKASI)
 * Mengambil file dari memory buffer, upload ke MinIO, simpan ke DB, 
 * dan kirim notifikasi otomatis ke Admin.
 */
exports.addReview = async (req, res) => {
  try {
    const { rating, comment, post_id } = req.body;
    const user_id = req.user.id;
    let image_url = null;

    // Proses Upload Foto ke MinIO jika ada
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

    // Simpan Review ke Database
    const query = `
      INSERT INTO reviews (rating, comment, post_id, user_id, image_url, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    const values = [Number(rating), comment, Number(post_id), user_id, image_url];
    const result = await pool.query(query, values);

    // --- LOGIKA NOTIFIKASI OTOMATIS KE ADMIN ---
// --- LOGIKA NOTIFIKASI OTOMATIS (Update sesuai Database Meillia) ---
try {
  const adminRes = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  
  if (adminRes.rows.length > 0) {
    const adminId = adminRes.rows[0].id;
    const notifQuery = `
      INSERT INTO notifications (user_id, sender_id, post_id, type, title, message, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
    `;
    const notifValues = [
      adminId,           // user_id (penerima: admin)
      user_id,           // sender_id (kamu/user yang review)
      postId,            // post_id
      'review',          // type
      'Ulasan Baru!',    // title
      `${req.user.username} memberikan rating ${rating} ⭐ pada produk ini.`
    ];
    await pool.query(notifQuery, notifValues);
  }
} catch (notifErr) {
  console.error("⚠️ Gagal membuat notifikasi:", notifErr.message);
}

    res.status(201).json({ 
      message: "Review berhasil ditambahkan", 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error("❌ Error Backend AddReview:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 2. AMBIL REVIEW BERDASARKAN POST
 * Menampilkan list review beserta data user yang memberikan ulasan.
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
 * 3. HAPUS REVIEW
 * Validasi kepemilikan atau role admin sebelum menghapus di MinIO dan DB.
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params; 
    const user_id = req.user.id; 
    const user_role = String(req.user.role).toLowerCase().trim();

    // 1. Cari data review
    const findReview = await pool.query(
      "SELECT image_url, user_id FROM reviews WHERE id = $1",
      [id]
    );

    if (findReview.rows.length === 0) {
      return res.status(404).json({ message: "Review tidak ditemukan" });
    }

    const reviewOwnerId = findReview.rows[0].user_id;
    const imageUrl = findReview.rows[0].image_url;

    // 2. VALIDASI IZIN
    if (user_role !== 'admin' && reviewOwnerId !== user_id) {
      return res.status(403).json({ 
        status: 'error',
        message: "Anda tidak memiliki izin untuk menghapus ulasan ini" 
      });
    }

    // 3. Hapus foto di MinIO jika ada
    if (imageUrl) {
      try {
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, imageUrl);
        console.log(`✅ File ${imageUrl} dihapus dari MinIO`);
      } catch (minioErr) {
        console.error("⚠️ MinIO Cleanup Warning:", minioErr.message);
      }
    }

    // 4. Hapus dari Database
    await pool.query("DELETE FROM reviews WHERE id = $1", [id]);

    res.json({ 
      status: 'success', 
      message: user_role === 'admin' 
        ? "Review berhasil dihapus oleh Admin ✨" 
        : "Review Anda berhasil dihapus ✨" 
    });
  } catch (error) {
    console.error("❌ Error Backend DeleteReview:", error);
    res.status(500).json({ message: error.message });
  }
};