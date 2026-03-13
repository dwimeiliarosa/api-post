const pool = require('../config/db');

/**
 * Mengambil semua notifikasi untuk user yang sedang login
 * Sesuai dengan kolom di pgAdmin: id, user_id, sender_id, post_id, message, is_read, title, type
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Diambil dari middleware authenticateToken

    // Query menggunakan JOIN ke tabel users agar bisa menampilkan nama pengirim (sender)
    const query = `
      SELECT 
        n.id, 
        n.user_id, 
        n.sender_id, 
        u.username AS sender_name,
        n.post_id, 
        n.title, 
        n.message, 
        n.is_read, 
        n.type, 
        n.created_at
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.user_id = $1 
      ORDER BY n.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);

    res.status(200).json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Gagal mengambil notifikasi' 
    });
  }
};

/**
 * Menandai satu notifikasi sebagai sudah dibaca
 * Sesuai dengan hook frontend: api.put(`/notifications/${id}/read`)
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Update is_read menjadi true berdasarkan ID notifikasi dan pemiliknya
    const query = `
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Notifikasi tidak ditemukan atau bukan milik Anda'
      });
    }

    res.status(200).json({ 
      status: 'success',
      message: 'Notifikasi ditandai sudah dibaca' 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Gagal memperbarui notifikasi' 
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      "UPDATE notifications SET is_read = true WHERE user_id = $1",
      [userId]
    );

    res.status(200).json({ 
      status: 'success', 
      message: 'Semua notifikasi ditandai telah dibaca' 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Jangan lupa export
module.exports = { getNotifications, markAsRead, markAllAsRead };