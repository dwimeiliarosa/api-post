const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

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
 *     tags: [Authentication]
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
 */
router.post('/register', authController.register);

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
 *                 example: "123456"
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
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
 */
router.get('/profile', authenticateToken, authController.profile);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Ambil data user yang sedang login (Sync Frontend)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data user berhasil diambil
 *       401:
 *         description: Unauthorized
 */
router.get('/auth/me', authenticateToken, authController.profile);

/**
 * @swagger
 * /update-profile:
 *   put:
 *     summary: Update profile user (Text Only)
 *     tags: [Authentication]
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
 *                 example: Dwi New
 *               email:
 *                 type: string
 *                 example: dwi_new@email.com
 *               skin_type:
 *                 type: string
 *                 enum: [Oily, Dry, Sensitive, Combination, Normal]
 *                 example: Oily
 */
router.put('/update-profile', authenticateToken, authController.updateProfile);

/**
 * @swagger
 * /update-avatar:
 *   patch:
 *     summary: Update foto profil (Upload Image to MinIO)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 */
router.patch(
  '/update-avatar',
  authenticateToken,
  upload.single('avatar'),
  authController.updateAvatar
);

/**
 * @swagger
 * /delete-avatar:
 *   delete:
 *     summary: Hapus foto profil (Back to default)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Foto profil berhasil dihapus
 *       400:
 *         description: User belum memiliki foto profil
 *       401:
 *         description: Unauthorized
 */
// Di authRoutes.js, pastikan baris ini ada:
router.delete('/delete-avatar', authenticateToken, authController.deleteAvatar);

module.exports = router;