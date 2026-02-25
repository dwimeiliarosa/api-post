const express = require('express');
const multer = require('multer'); 
const postController = require('../controllers/postController');

const router = express.Router();

/**
 * MULTER CONFIG - MEMORY STORAGE
 * Menggunakan memoryStorage agar Sharp bisa memproses buffer secara langsung
 * tanpa membuat file sampah di folder lokal.
 */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
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
 *     summary: Ambil semua postingan
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 */
router.get('/posts', postController.getPosts);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Buat postingan baru
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - judul
 *               - isi
 *               - category_id
 *               - gambar
 *               - file
 *             properties:
 *               judul:
 *                 type: string
 *               isi:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               gambar:
 *                 type: string
 *                 format: binary
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post berhasil dibuat
 *       400:
 *         description: Validasi gagal
 */
router.post(
  '/posts',
  upload.fields([
    { name: 'gambar', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]),
  postController.createPost
);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update postingan
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post berhasil diupdate
 */
router.put('/posts/:id', postController.updatePost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Hapus postingan
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post berhasil dihapus
 */
router.delete('/posts/:id', postController.deletePost);

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