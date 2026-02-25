const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API untuk login dan token
 */

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
 *       400:
 *         description: Email dan password wajib diisi
 *       401:
 *         description: Email atau password salah
 */
router.post('/login', authController.login);

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
 *       401:
 *         description: Refresh token required
 *       403:
 *         description: Invalid atau expired refresh token
 */
router.post('/refresh-token', authController.refreshToken);

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
router.get('/profile', authenticateToken, authController.profile);

module.exports = router;