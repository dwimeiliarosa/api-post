const pool = require('../config/db');
const Joi = require('joi');

/* VALIDATION SCHEMA */
const categorySchema = Joi.object({
  name: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.empty': 'nama wajib di isi',
      'any.required': 'nama wajib di isi',
      'string.min': 'nama minimal harus 3 karakter'
    })
});
/* GET ALL */
exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY id ASC'
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* CREATE */
exports.createCategory = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    const { name } = req.body;

    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = categorySchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    const { name } = req.body;

    const result = await pool.query(
      'UPDATE categories SET name=$1 WHERE id=$2 RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Category tidak ditemukan'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM categories WHERE id=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Category tidak ditemukan'
      });
    }

    res.json({
      status: 'success',
      message: 'Kategori berhasil dihapus'
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};