const express = require('express');
const pool = require('../config/db');
const Joi = require('joi');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API untuk mengelola kategori
 */

const schema = Joi.object({
  name: Joi.string().min(3).max(100).required()
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Ambil semua kategori
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 */
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tambah kategori baru
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 *       400:
 *         description: Validasi gagal
 */
router.post('/categories', async (req, res) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    const { name } = req.body;

    const existing = await pool.query(
      'SELECT * FROM categories WHERE name=$1',
      [name]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Category sudah ada'
      });
    }

    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update kategori
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil update
 *       404:
 *         description: Category tidak ditemukan
 */
router.put('/categories/:id', async (req, res) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id } = req.params;
    const { name } = req.body;

    const check = await pool.query(
      'SELECT * FROM categories WHERE id=$1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Category tidak ditemukan' });
    }

    const result = await pool.query(
      'UPDATE categories SET name=$1 WHERE id=$2 RETURNING *',
      [name, id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Hapus kategori
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil hapus
 *       404:
 *         description: Category tidak ditemukan
 */
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query(
      'SELECT * FROM categories WHERE id=$1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Category tidak ditemukan' });
    }

    await pool.query(
      'DELETE FROM categories WHERE id=$1',
      [id]
    );

    res.json({ message: 'Category berhasil dihapus' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;