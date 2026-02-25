const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_SECRET
} = require('../utils/token');

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        message: 'Email dan password wajib diisi'
      });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Email tidak ditemukan'
      });
    }

    const user = result.rows[0];

    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
      return res.status(401).json({
        message: 'Password salah'
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await pool.query(
      'UPDATE users SET refresh_token=$1 WHERE id=$2',
      [refreshToken, user.id]
    );

    res.json({
      status: 'success',
      accessToken,
      refreshToken
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// ================= REFRESH TOKEN =================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: 'Refresh token required'
      });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE refresh_token=$1',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        message: 'Invalid refresh token'
      });
    }

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          message: 'Token expired'
        });
      }

      const newAccessToken = generateAccessToken({
        id: decoded.id,
        email: result.rows[0].email
      });

      res.json({
        accessToken: newAccessToken
      });
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// ================= PROFILE (PROTECTED) =================
exports.profile = (req, res) => {
  res.json({
    message: 'Profile accessed',
    user: req.user
  });
};