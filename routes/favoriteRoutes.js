const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: API untuk mengelola daftar favorit user
 */

// Semua route di bawah ini wajib login
router.use(authenticateToken);

/**
 * @swagger
 * /favorites/me:
 *   get:
 *     summary: Ambil semua produk favorit user yang sedang login
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar favorit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       judul:
 *                         type: string
 *                       gambar:
 *                         type: string
 *                       category_name:
 *                         type: string
 *       401:
 *         description: Unauthorized (Token tidak valid)
 *       500:
 *         description: Kesalahan server
 */
router.get('/me', favoriteController.getMyFavorites);

/**
 * @swagger
 * /favorites/toggle/{id}:
 *   post:
 *     summary: Toggle Favorite (Tambah atau Hapus dari favorit)
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID postingan/produk
 *     responses:
 *       200:
 *         description: Berhasil menghapus dari favorit
 *       201:
 *         description: Berhasil menambahkan ke favorit
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post tidak ditemukan
 */
router.post('/toggle/:id', favoriteController.toggleFavorite);

module.exports = router;