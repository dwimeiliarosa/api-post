const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const uploadPath = path.join(__dirname, '../public/images');

/* HELPER DELETE FILE */
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

/* =========================
   GET ALL POSTS
========================= */
exports.getPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.*, categories.name AS category_name
      FROM posts
      LEFT JOIN categories
      ON posts.category_id = categories.id
      ORDER BY posts.id ASC
    `);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   CREATE POST
========================= */
exports.createPost = async (req, res) => {
  try {
    const { judul, isi, category_id } = req.body;
    const gambar = req.files?.gambar?.[0];
    const fileUpload = req.files?.file?.[0];

    const errors = [];

    if (!judul?.trim()) errors.push('Judul wajib diisi');
    if (!isi?.trim()) errors.push('Isi wajib diisi');
    if (!gambar) errors.push('Gambar wajib diupload');
    if (!fileUpload) errors.push('File wajib diupload');
    if (!category_id) errors.push('Category wajib dipilih');

    if (errors.length > 0) {
      await deleteUploadedFiles(req.files);
      return res.status(400).json({
        status: 'error',
        message: 'Validasi gagal',
        errors
      });
    }

    // cek category ada
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

    const result = await pool.query(
      `INSERT INTO posts (judul, isi, gambar, file, category_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
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
};

/* =========================
   UPDATE POST
========================= */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, isi, category_id } = req.body;

    if (!judul?.trim() || !isi?.trim() || !category_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Judul, isi dan category wajib diisi'
      });
    }

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
      `UPDATE posts
       SET judul=$1, isi=$2, category_id=$3
       WHERE id=$4
       RETURNING *`,
      [judul.trim(), isi.trim(), category_id, id]
    );

    res.json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE POST
========================= */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await pool.query(
      'SELECT * FROM posts WHERE id=$1',
      [id]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post tidak ditemukan'
      });
    }

    await pool.query('DELETE FROM posts WHERE id=$1', [id]);

    res.json({
      status: 'success',
      message: 'Data berhasil dihapus'
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};