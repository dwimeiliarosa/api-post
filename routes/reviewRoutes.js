const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API untuk memberikan rating, ulasan produk, dan manajemen review
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Tambah review baru + Upload Foto (Multipart)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - post_id
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Cepat meresap dan nggak lengket! ✨"
 *               post_id:
 *                 type: integer
 *                 example: 1
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Foto bukti penggunaan produk (Max 2MB)
 *     responses:
 *       201:
 *         description: Review & Foto berhasil diunggah
 *       400:
 *         description: Data tidak lengkap
 */
router.post('/', authenticateToken, upload.single('image'), reviewController.addReview);

/**
 * @swagger
 * /reviews/product/{post_id}:
 *   get:
 *     summary: Ambil semua review berdasarkan ID Produk
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID dari produk (post)
 *     responses:
 *       200:
 *         description: List review berhasil diambil
 */
// Menggunakan path /product/ agar spesifik dan tidak bentrok dengan rute DELETE
router.get('/product/:post_id', reviewController.getReviewsByPost);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Hapus ulasan (Admin atau Pemilik)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ulasan yang ingin dihapus
 *     responses:
 *       200:
 *         description: Berhasil menghapus ulasan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Review dan foto berhasil dihapus dari sistem ✨
 *       403:
 *         description: Tidak memiliki izin (Bukan admin atau bukan pemilik)
 *       404:
 *         description: Review tidak ditemukan
 *       500:
 *         description: Error server
 */
router.delete('/:id', authenticateToken, reviewController.deleteReview);


module.exports = router;