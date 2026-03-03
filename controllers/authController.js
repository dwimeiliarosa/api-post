const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
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
      role: user.role
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
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({
      status: 'success',
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROFILE (NEW) =================
exports.updateProfile = async (req, res) => {
  console.log("KIRIMAN DATA DARI FRONTEND SAMPAI KE SINI!");
  try {
    const userId = req.user.id; // Diambil dari middleware authenticateToken
    const { username, email } = req.body;

    if (!username?.trim() || !email?.trim()) {
      return res.status(400).json({ message: 'Username dan Email tidak boleh kosong' });
    }

    // Query UPDATE untuk PostgreSQL
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, role',
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
    // Menangani error jika email baru ternyata sudah dipakai orang lain (Unique Constraint)
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email sudah digunakan oleh user lain' });
    }
    res.status(500).json({ message: error.message });
  }
};