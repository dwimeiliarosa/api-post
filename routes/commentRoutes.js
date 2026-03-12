const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API untuk ruang diskusi dan komentar pengguna
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Tambah komentar baru
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post_id
 *               - isi_komentar
 *             properties:
 *               post_id:
 *                 type: integer
 *               isi_komentar:
 *                 type: string
 *     responses:
 *       201:
 *         description: Komentar berhasil dibuat
 */
router.post('/', authenticateToken, commentController.addComment);

/**
 * @swagger
 * /comments/post/{post_id}:
 *   get:
 *     summary: Ambil semua komentar berdasarkan ID Postingan
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar komentar
 */
router.get('/post/:post_id', commentController.getCommentsByPost);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Hapus komentar
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Komentar berhasil dihapus
 */
router.delete('/:id', authenticateToken, commentController.deleteComment);

module.exports = router;