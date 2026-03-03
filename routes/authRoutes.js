const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Gunakan destructuring karena middleware mengekspor object
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API untuk registrasi, login, dan manajemen token
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registrasi user baru
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: dwimeilia
 *               email:
 *                 type: string
 *                 example: dwi@email.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Data tidak valid
 *       500:
 *         description: Kesalahan server
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
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
 *         description: Email atau password salah
 *       500:
 *         description: Kesalahan server
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Authentication
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
 *         description: Access token baru berhasil dibuat
 *       400:
 *         description: Refresh token tidak valid
 *       500:
 *         description: Kesalahan server
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get profile (Protected)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile berhasil diakses
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Kesalahan server
 */
router.get('/profile', authenticateToken, authController.profile);

/**
 * Endpoint tambahan /auth/me (opsional, untuk sinkronisasi dengan frontend)
 */
router.get('/auth/me', authenticateToken, authController.profile);
/**
 * @swagger
 * /auth/update-profile:
 *   put:
 *     summary: Update profile user (Protected)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: Eka Kurnia New
 *               email:
 *                 type: string
 *                 example: eka_new@email.com
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       401:
 *         description: Unauthorized (Token tidak valid)
 *       404:
 *         description: User tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.put('/update-profile', authenticateToken, authController.updateProfile);

module.exports = router;