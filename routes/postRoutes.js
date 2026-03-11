const express = require('express'); // BARIS INI YANG HILANG
const multer = require('multer'); 
const postController = require('../controllers/postController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router(); 

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API untuk mengelola postingan
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Ambil semua postingan (Pagination & Limit)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Halaman ke berapa
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Jumlah data per slide (default 8)
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 */
router.get('/posts', postController.getAllPosts);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Buat postingan baru
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               judul:
 *                 type: string
 *               isi:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               suitable_for:
 *                 type: string
 *                 enum: [Oily, Dry, Sensitive, Combination, Normal]
 *                 description: Jenis kulit yang cocok untuk produk ini
 *               gambar:
 *                 type: string
 *                 format: binary
 */
router.post(
  '/posts', 
  authenticateToken, 
  isAdmin, 
  upload.single('gambar'), 
  postController.createPost
);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Ambil satu postingan berdasarkan ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID postingan
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 *       404:
 *         description: Post tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get('/posts/:id', postController.getPostById);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update postingan
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID postingan
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               judul:
 *                 type: string
 *               isi:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               suitable_for:             # TAMBAHKAN INI
 *                 type: string
 *                 enum: [Oily, Dry, Sensitive, Combination, Normal]
 *               gambar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post berhasil diupdate
 *       # ... rest of responses
 */
router.put(
  '/posts/:id',
  authenticateToken,
  isAdmin,
  upload.single('gambar'), // Samakan menjadi single agar konsisten
  postController.updatePost
);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Hapus postingan
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID postingan
 *     responses:
 *       200:
 *         description: Post berhasil dihapus
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.delete(
  '/posts/:id', 
  authenticateToken, 
  isAdmin, 
  postController.deletePost
);

/* HANDLE MULTER ERROR */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  next(err);
});

module.exports = router;