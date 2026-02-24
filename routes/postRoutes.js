const express = require('express');
const multer = require('multer');
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const uploadPath = path.join(__dirname, '../public/images');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
/* MULTER CONFIG*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // max 5MB
  }
});
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  next(err);
});

/* HELPER FUNCTION HAPUS FILE JIKA VALIDASI GAGAL*/

const deleteUploadedFiles = async (files) => {
  if (!files) return;

  const allFiles = [
    ...(files.gambar || []),
    ...(files.file || [])
  ];

  for (const file of allFiles) {
    try {
      await fs.promises.unlink(path.join(uploadPath, file.filename));
    } catch (err) {
      console.error('Gagal menghapus file:', file.filename);
    }
  }
};

/*GET POSTS*/

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Ambil semua postingan
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data postingan
 */
router.get('/posts', async (req, res) => {
  try {
    const result = await pool.query(
  `SELECT posts.*, categories.name AS category_name 
   FROM posts 
   LEFT JOIN categories 
   ON posts.category_id = categories.id 
   ORDER BY posts.id ASC`
);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
  async (req, res) => {
    try {
      console.log(req.body);
      console.log(req.files);
      const { judul, isi, category_id } = req.body;
      const gambar = req.files?.gambar?.[0];
      const fileUpload = req.files?.file?.[0];
      

      const errors = [];

      // Validasi text
      if (!judul?.trim())
        errors.push('Judul wajib diisi');

      if (!isi?.trim())
        errors.push('Isi wajib diisi');

      // Validasi file
      if (!gambar)
        errors.push('Gambar wajib diupload');

      if (!fileUpload)
        errors.push('File wajib diupload');
      
      if (!category_id)
        errors.push('Category wajib dipilih');

      // Jika validasi gagal → hapus file & tolak request
      if (errors.length > 0) {
        await deleteUploadedFiles(req.files);

        return res.status(400).json({
          status: 'error',
          message: 'Validasi gagal',
          errors
        });
      }
const categoryCheck = await pool.query(
  'SELECT * FROM categories WHERE id=$1',
  [category_id]
);

if (categoryCheck.rows.length === 0) {
  await deleteUploadedFiles(req.files);

  return res.status(400).json({
    status: 'error',
    message: 'Category tidak ditemukan'
  });
}
      // Insert ke database
      const result = await pool.query(
        'INSERT INTO posts (judul, isi, gambar, file, category_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [
          judul.trim(),
          isi.trim(),
          gambar.filename,
          fileUpload.filename,
          category_id
        ]
      );

      res.status(201).json({
        status: 'success',
        data: result.rows[0]
      });

    } catch (err) {

     
      await deleteUploadedFiles(req.files);

      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  }
);

/* UPDATE POST */

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update postingan
 *     tags: [Posts]
 */
router.put('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, isi, category_id } = req.body;

    if (!judul || !isi || !category_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Judul, isi dan category wajib diisi'
      });
    }

    // cek category ada
    const categoryCheck = await pool.query(
      'SELECT * FROM categories WHERE id=$1',
      [category_id]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Category tidak ditemukan'
      });
    }

    const result = await pool.query(
      'UPDATE posts SET judul=$1, isi=$2, category_id=$3 WHERE id=$4 RETURNING *',
      [judul.trim(), isi.trim(), category_id, id]
    );

    res.json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   DELETE POST
========================= */

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Hapus postingan
 *     tags: [Posts]
 */
router.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM posts WHERE id=$1', [id]);

    res.json({ message: 'Data berhasil dihapus' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;