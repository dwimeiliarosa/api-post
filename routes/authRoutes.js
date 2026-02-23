const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_SECRET
} = require('../utils/token');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: AdminDwi@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Unauthorized
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        message: 'Email dan password wajib diisi'
      });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Email tidak ditemukan'
      });
    }

    const user = result.rows[0];

    const validPassword = await argon2.verify(
      user.password,
      password
    );

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

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
});

/**

 * @swagger

 * /refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your_refresh_token_here
 *     responses:
 *       200:
 *         description: Access token baru
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       403:
 *         description: Invalid refresh token
 */
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: 'Refresh token required' });

  const result = await pool.query(
    'SELECT * FROM users WHERE refresh_token=$1',
    [refreshToken]
  );

  if (result.rows.length === 0)
    return res.status(403).json({ message: 'Invalid refresh token' });

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: 'Token expired' });

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      email: result.rows[0].email
    });

    res.json({ accessToken: newAccessToken });
  });
});

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get profile (Protected)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile berhasil diakses
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Profile accessed',
    user: req.user
  });
});

module.exports = router;