const pool = require('../config/db');
const sharp = require('sharp');
const { minioClient } = require('../config/minio');
const { getPagination, formatPagination } = require('../utils/pagination');

const getPublicUrl = (fileName) => {
  const baseDomain = process.env.MINIO_PUBLIC_URL;
  const bucket = process.env.MINIO_BUCKET_NAME;
  return `${baseDomain}/${bucket}/${fileName}`;
};

const getAllPosts = async (req, res) => {
  try {
    // 1. Gunakan utilitas pagination (mengambil limit dari Swagger/URL)
    const { limit, offset, page } = getPagination(req.query);

    const postsQuery = `
      SELECT p.*, c.name AS category_name 
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = `SELECT COUNT(*) FROM posts`;

    const [postsResult, countResult] = await Promise.all([
      pool.query(postsQuery, [limit, offset]),
      pool.query(countQuery)
    ]);

    const totalData = parseInt(countResult.rows[0].count);

    res.json({
      status: "success",
      data: postsResult.rows.map(post => ({
        ...post,
        gambar: post.gambar ? getPublicUrl(post.gambar) : null
      })),
      meta: formatPagination(totalData, limit, page)
    });
  } catch (error) {
    console.error('❌ ERROR GET ALL POSTS:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { judul, isi, category_id } = req.body;
    const gambarFile = req.file; 
    const userId = req.user.id;

    if (!judul?.trim() || !isi?.trim() || !gambarFile || !category_id) {
      return res.status(400).json({ status: 'error', message: 'Validasi gagal' });
    }

    const bucketName = process.env.MINIO_BUCKET_NAME;
    const optimizedImageName = `img-${Date.now()}.webp`;
    
    const optimizedImageBuffer = await sharp(gambarFile.buffer)
      .resize(800)
      .webp({ quality: 80 })
      .toBuffer();

    await minioClient.putObject(bucketName, optimizedImageName, optimizedImageBuffer, {
      'Content-Type': 'image/webp'
    });

    const result = await pool.query(
      `INSERT INTO posts (judul, isi, gambar, category_id, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [judul.trim(), isi.trim(), optimizedImageName, category_id, userId]
    );

    res.status(201).json({
      status: 'success',
      message: 'Post berhasil dibuat! ✨',
      data: { ...result.rows[0], gambar: getPublicUrl(result.rows[0].gambar) }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, isi, category_id } = req.body;
    const newGambarFile = req.file;

    const checkPost = await pool.query('SELECT gambar FROM posts WHERE id=$1', [id]);
    if (checkPost.rows.length === 0) return res.status(404).json({ message: 'Post tidak ditemukan' });

    let finalImageName = checkPost.rows[0].gambar;

    if (newGambarFile) {
      const bucketName = process.env.MINIO_BUCKET_NAME;
      finalImageName = `img-${Date.now()}.webp`;
      const buffer = await sharp(newGambarFile.buffer).resize(800).webp({ quality: 80 }).toBuffer();
      await minioClient.putObject(bucketName, finalImageName, buffer, { 'Content-Type': 'image/webp' });
      
      if (checkPost.rows[0].gambar) {
        try { await minioClient.removeObject(bucketName, checkPost.rows[0].gambar); } catch (e) {}
      }
    }

    const result = await pool.query(
      `UPDATE posts SET judul=$1, isi=$2, category_id=$3, gambar=$4 WHERE id=$5 RETURNING *`,
      [judul.trim(), isi.trim(), category_id, finalImageName, id]
    );

    res.json({ 
      status: 'success', 
      data: { ...result.rows[0], gambar: getPublicUrl(result.rows[0].gambar) } 
    });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await pool.query('SELECT gambar FROM posts WHERE id=$1', [id]);
    if (post.rows.length === 0) return res.status(404).json({ message: 'Post tidak ditemukan' });

    const bucketName = process.env.MINIO_BUCKET_NAME;
    await pool.query('DELETE FROM posts WHERE id=$1', [id]);
    if (post.rows[0].gambar) {
      try { await minioClient.removeObject(bucketName, post.rows[0].gambar); } catch (e) {}
    }
    res.json({ status: 'success', message: 'Data dihapus' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name FROM posts p 
       LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1`, [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ status: 'success', data: { ...result.rows[0], gambar: getPublicUrl(result.rows[0].gambar) } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const toggleFavorite = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;
  try {
    const check = await pool.query('SELECT * FROM favorites WHERE user_id=$1 AND post_id=$2', [userId, postId]);
    if (check.rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE user_id=$1 AND post_id=$2', [userId, postId]);
      return res.json({ isFavorited: false });
    }
    await pool.query('INSERT INTO favorites (user_id, post_id) VALUES ($1, $2)', [userId, postId]);
    res.json({ isFavorited: true });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// EXPORT SEMUA FUNGSI (Penting: Nama harus sama dengan yang dipanggil di Routes)
module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
  toggleFavorite
};