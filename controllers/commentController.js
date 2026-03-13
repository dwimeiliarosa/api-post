const pool = require('../config/db');
const axios = require('axios');

// ==========================================
// FUNGSI HELPER (WhatsApp)
// ==========================================
const sendWhatsappNotification = async (target, message) => {
  try {
    const FONNTE_TOKEN = 'BfhVZ4mhRKnbcYSNpLQg';
    
    let cleanNumber = target.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '62' + cleanNumber.slice(1);
    }

    const response = await axios.post('https://api.fonnte.com/send', {
      target: cleanNumber, 
      message: message,
    }, {
      headers: { 'Authorization': FONNTE_TOKEN }
    });
    
    console.log("✅ Respon Fonnte:", response.data);
  } catch (err) {
    console.error("❌ Gagal kirim WA:", err.response?.data || err.message);
  }
};

// ==========================================
// CONTROLLER FUNCTIONS
// ==========================================

const getCommentsByPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const result = await pool.query(
      `SELECT c.*, u.username, u.avatar 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [post_id]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { post_id, isi_komentar, parent_id } = req.body;
    
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'User tidak terautentikasi' });
    }
    
    const user_id = req.user.id;
    const username = req.user.nama || req.user.username || 'User GlowUp';

    // 1. Simpan Komentar
    const insertResult = await pool.query(
      `INSERT INTO comments (post_id, user_id, isi_komentar, parent_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [post_id, user_id, isi_komentar.trim(), parent_id || null]
    );

    const newComment = insertResult.rows[0];

    // 2. Logika Notifikasi WA & Database
    if (!parent_id || parent_id === "" || parent_id === 0) {
        console.log("[WA DEBUG] Komentar utama masuk. Mencari admin..."); 

        // Query admin (menggunakan TRIM seperti yang Anda tes di pgAdmin)
        const admins = await pool.query("SELECT id, phone FROM users WHERE TRIM(role) = 'admin'");
        
        console.log(`[WA DEBUG] Admin ditemukan: ${admins.rows.length} orang`);

        for (let admin of admins.rows) {
            // --- INSERT KE TABEL NOTIFICATIONS (Sesuai kolom di gambar Anda) ---
            // Menggunakan sender_id, post_id, title, message, type sesuai struktur gambar
            try {
                await pool.query(
                    `INSERT INTO notifications (user_id, sender_id, post_id, title, message, type, is_read) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        admin.id,             // user_id (penerima)
                        user_id,              // sender_id (pengirim komentar)
                        post_id,              // post_id
                        'Komentar Baru',      // title
                        `${username} berkomentar: "${isi_komentar.trim()}"`, // message
                        'comment',            // type
                        false                 // is_read
                    ]
                );
            } catch (dbErr) {
                console.error("⚠️ Gagal simpan ke tabel notifications:", dbErr.message);
            }

            // --- KIRIM WHATSAPP ---
            if (admin.phone) {
                const waMessage = `📢 *Notifikasi GlowUp.Space*\n\nAda komentar baru!\n\n👤 *Pengirim:* ${username}\n💬 *Komentar:* "${isi_komentar.trim()}"\n📍 *Post ID:* ${post_id}`;
                await sendWhatsappNotification(admin.phone, waMessage);
            }
        }
    }

    // 3. Response Berhasil
    const result = await pool.query(
      `SELECT c.*, u.username, u.avatar 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`, [newComment.id]
    );

    res.status(201).json({ status: 'success', data: result.rows[0] });

  } catch (error) {
    console.error("❌ ERROR ADD COMMENT:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = String(req.user.role).toLowerCase();

    const check = await pool.query('SELECT user_id FROM comments WHERE id = $1', [id]);
    
    if (check.rows.length === 0) return res.status(404).json({ message: 'Komentar tidak ditemukan' });

    if (user_role === 'admin' || Number(check.rows[0].user_id) === Number(user_id)) {
      await pool.query('DELETE FROM comments WHERE id = $1', [id]);
      return res.json({ status: 'success', message: 'Komentar berhasil dihapus' });
    }
    return res.status(403).json({ status: 'error', message: 'Akses ditolak' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getCommentsByPost, addComment, deleteComment };