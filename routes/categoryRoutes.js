const express = require('express');
const pool = require('../config/db');
const Joi = require('joi');

const router = express.Router();
const categoryController = require('../controllers/categoryController');
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API untuk mengelola kategori
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Ambil semua kategori
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 */
router.get('/categories', categoryController.getCategories);

/**
 * @swagger
 * /categories:
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
router.post('/categories', categoryController.createCategory);

/**
 * @swagger
 * /categories/{id}:
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
router.put('/categories/:id', categoryController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
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
router.delete('/categories/:id', categoryController.deleteCategory);

module.exports = router;