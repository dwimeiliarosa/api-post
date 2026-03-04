const pool = require('../config/db');

// Ambil daftar favorit milik user login
exports.getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name 
       FROM favorites f
       JOIN posts p ON f.post_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE f.user_id = $1
       ORDER BY f.id DESC`,
      [userId]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error("GET FAV ERROR:", error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Tambah atau Hapus favorit (Toggle)
exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.id);

    if (!postId) return res.status(400).json({ message: "ID Post tidak valid" });

    const checkFav = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (checkFav.rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE user_id = $1 AND post_id = $2', [userId, postId]);
      return res.status(200).json({ status: 'success', isFavorited: false });
    } else {
      await pool.query('INSERT INTO favorites (user_id, post_id) VALUES ($1, $2)', [userId, postId]);
      return res.status(201).json({ status: 'success', isFavorited: true });
    }
  } catch (error) {
    console.error("TOGGLE ERROR:", error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};