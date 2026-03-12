// controllers/commentController.js

const pool = require('../config/db');

// Ambil komentar berdasarkan ID Postingan
const getCommentsByPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    
    // PERBAIKAN: Memastikan u.avatar ditarik dari tabel users melalui JOIN
    const result = await pool.query(
      `SELECT c.*, u.username, u.avatar 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [post_id]
    );
    
    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Tambah komentar baru
const addComment = async (req, res) => {
  try {
    const { post_id, isi_komentar } = req.body;
    const user_id = req.user.id; // Diambil dari authenticateToken middleware

    if (!isi_komentar?.trim() || !post_id) {
      return res.status(400).json({ status: 'error', message: 'Data tidak lengkap' });
    }

    // Eksekusi insert komentar
    const insertResult = await pool.query(
      `INSERT INTO comments (post_id, user_id, isi_komentar) 
       VALUES ($1, $2, $3) RETURNING *`,
      [post_id, user_id, isi_komentar.trim()]
    );

    // OPSIONAL: Jika ingin langsung mendapatkan username & avatar setelah insert tanpa refresh
    const newCommentId = insertResult.rows[0].id;
    const result = await pool.query(
      `SELECT c.*, u.username, u.avatar 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [newCommentId]
    );

    res.status(201).json({
      status: 'success',
      message: 'Komentar berhasil ditambahkan!',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Hapus komentar (Hanya bisa oleh pemilik komentar atau Admin)
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    // Cek apakah komentar ada
    const check = await pool.query('SELECT user_id FROM comments WHERE id = $1', [id]);
    
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }

    // Autoritas: Hanya pemilik atau admin yang boleh hapus
    if (check.rows[0].user_id !== user_id && user_role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki akses untuk menghapus komentar ini' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ status: 'success', message: 'Komentar berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getCommentsByPost, addComment, deleteComment };