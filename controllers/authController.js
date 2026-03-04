const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { minioClient } = require('../config/minio');
const sharp = require('sharp');
const {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_SECRET
} = require('../utils/token');

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({
        message: 'Semua field (username, email, password) wajib diisi'
      });
    }

    const userExist = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.trim()]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({
        message: 'Email sudah terdaftar, silakan gunakan email lain'
      });
    }

    const hashedPassword = await argon2.hash(password);

    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username.trim(), email.trim(), hashedPassword, 'user']
    );

    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil!',
      data: newUser.rows[0]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email tidak ditemukan' });
    }

    const user = result.rows[0];
    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Password salah' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await pool.query(
      'UPDATE users SET refresh_token=$1 WHERE id=$2',
      [refreshToken, user.id]
    );

res.json({
  status: 'success',
  message: 'Login Berhasil',
  accessToken,
  refreshToken,
  role: user.role,
  username: user.username // <-- TAMBAHKAN BARIS INI
});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= REFRESH TOKEN =================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE refresh_token=$1',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Token expired' });

      const newAccessToken = generateAccessToken({
        id: decoded.id,
        email: result.rows[0].email,
        role: result.rows[0].role
      });

      res.json({ accessToken: newAccessToken });
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= PROFILE (GET) =================
exports.profile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, avatar FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({
      status: 'success',
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        role: result.rows[0].role,
        avatar: result.rows[0].avatar || null 
      }
    });
  } catch (error) {
    console.error("Error di Profile:", error.message);
    res.status(500).json({ message: "Gagal ambil data profil" });
  }
};

// ================= UPDATE PROFILE (TEXT ONLY) =================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    if (!username?.trim() || !email?.trim()) {
      return res.status(400).json({ message: 'Username dan Email tidak boleh kosong' });
    }

    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, role, avatar',
      [username.trim(), email.trim(), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profil berhasil diperbarui',
      user: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email sudah digunakan oleh user lain' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE AVATAR (MINIO + SHARP) =================
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Pilih foto dulu ya!' });
    }

    const userId = req.user.id;
    const bucketName = process.env.MINIO_BUCKET_NAME;
    const fileName = `avatars/${userId}-${Date.now()}.webp`;

    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    await minioClient.putObject(
      bucketName,
      fileName,
      optimizedBuffer,
      optimizedBuffer.length,
      { 'Content-Type': 'image/webp' }
    );

    const avatarUrl = `http://localhost:3000/api/view-image/${fileName.replace('avatars/', 'avatars%2F')}`;

    const query = 'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, username, email, avatar';
    const values = [avatarUrl, userId];
    
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Foto profil berhasil diupdate! ✨',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error Update Avatar:', error);
    res.status(500).json({ message: 'Gagal update foto', error: error.message });
  }
};

// ================= DELETE AVATAR (NEW) =================
exports.deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Cari data user dulu buat dapet nama filenya
    const userResult = await pool.query('SELECT avatar FROM users WHERE id = $1', [userId]);
    const avatarUrl = userResult.rows[0]?.avatar;

    if (!avatarUrl) {
      return res.status(400).json({ message: "Kamu belum pasang foto profil, Kak!" });
    }

    // 2. Ambil nama file dari URL
    const fileName = decodeURIComponent(avatarUrl.split('view-image/')[1]);

    // 3. Hapus file di MinIO
    const bucketName = process.env.MINIO_BUCKET_NAME;
    await minioClient.removeObject(bucketName, fileName);

    // 4. Update database set avatar jadi NULL
    await pool.query('UPDATE users SET avatar = NULL WHERE id = $1', [userId]);

    res.status(200).json({
      status: 'success',
      message: 'Foto profil berhasil dihapus! ✨'
    });
  } catch (error) {
    console.error("Error Delete Avatar:", error);
    res.status(500).json({ message: "Gagal menghapus foto profil", error: error.message });
  }
};