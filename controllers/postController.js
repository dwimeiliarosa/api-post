const pool = require('../config/db');
const sharp = require('sharp');
const { minioClient } = require('../config/minio');

const getPublicUrl = (fileName) => {
  const baseDomain = process.env.MINIO_PUBLIC_URL;
  const bucket = process.env.MINIO_BUCKET_NAME;
  return `${baseDomain}/${bucket}/${fileName}`;
};

/* =========================
   GET ALL POSTS (With Favorite Status)
========================= */
exports.getPosts = async (req, res) => {
  try {
    const userId = req.user?.id || null;

    const result = await pool.query(`
      SELECT 
        p.*, 
        c.name AS category_name, 
        u.nama AS author_name,
        EXISTS (
          SELECT 1 FROM favorites f 
          WHERE f.post_id = p.id AND f.user_id = $1
        ) AS is_favorited 
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.id DESC
    `, [userId]);

    const formattedData = result.rows.map(post => ({
      ...post,
      category_name: post.category_name || 'Tanpa Kategori',
      author_name: post.author_name || 'Admin', 
      gambar: post.gambar ? getPublicUrl(post.gambar) : null,
      isFavorited: post.is_favorited 
    }));

    res.json({
      status: 'success',
      data: formattedData
    });
  } catch (err) {
    console.error('DATABASE ERROR:', err.message); 
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/* =========================
   CREATE POST (Fixed for upload.single)
========================= */
exports.createPost = async (req, res) => {
  try {
    // Debugging untuk melihat data yang masuk ke terminal
    console.log("--- DEBUG DATA MASUK ---");
    console.log("Body:", req.body);
    console.log("File:", req.file); // Pakai req.file (bukan files)

    const { judul, isi, category_id } = req.body;
    const gambarFile = req.file; // Ambil dari req.file karena di router pakai upload.single
    const userId = req.user.id;

    // 1. Validasi Input
    const errors = [];
    if (!judul?.trim()) errors.push('Judul wajib diisi');
    if (!isi?.trim()) errors.push('Isi wajib diisi');
    if (!gambarFile) errors.push('Gambar produk wajib diupload');
    if (!category_id) errors.push('Kategori wajib dipilih');

    if (errors.length > 0) {
      return res.status(400).json({ status: 'error', message: 'Validasi gagal', errors });
    }

    // 2. Cek apakah Kategori ada
    const categoryCheck = await pool.query('SELECT * FROM categories WHERE id=$1', [category_id]);
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Kategori tidak valid' });
    }

    // 3. Olah Gambar dengan Sharp
    const bucketName = process.env.MINIO_BUCKET_NAME;
    const optimizedImageName = `img-${Date.now()}.webp`;
    
    // Gunakan buffer dari req.file
    const optimizedImageBuffer = await sharp(gambarFile.buffer)
      .resize(800)
      .webp({ quality: 80 })
      .toBuffer();

    // 4. Upload ke MinIO
    await minioClient.putObject(bucketName, optimizedImageName, optimizedImageBuffer, {
      'Content-Type': 'image/webp'
    });

    // 5. Simpan ke Database
    const result = await pool.query(
      `INSERT INTO posts (judul, isi, gambar, category_id, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [judul.trim(), isi.trim(), optimizedImageName, category_id, userId]
    );

    res.status(201).json({
      status: 'success',
      message: 'Post berhasil dibuat! ✨',
      data: {
        ...result.rows[0],
        gambar: getPublicUrl(result.rows[0].gambar)
      }
    });

  } catch (err) {
    console.error('❌ ERROR CREATE POST:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/* =========================
   UPDATE POST (Fixed for upload.single)
========================= */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, isi, category_id } = req.body;
    const newGambarFile = req.file; // Konsisten pakai req.file

    const checkPost = await pool.query('SELECT gambar FROM posts WHERE id=$1', [id]);
    if (checkPost.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Post tidak ditemukan' });
    }

    let finalImageName = checkPost.rows[0].gambar;

    if (newGambarFile) {
      const bucketName = process.env.MINIO_BUCKET_NAME;
      finalImageName = `img-${Date.now()}.webp`;

      const buffer = await sharp(newGambarFile.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toBuffer();

      await minioClient.putObject(bucketName, finalImageName, buffer, {
        'Content-Type': 'image/webp'
      });

      // Hapus foto lama agar MinIO tidak penuh
      if (checkPost.rows[0].gambar) {
        try {
          await minioClient.removeObject(bucketName, checkPost.rows[0].gambar);
        } catch (e) { console.error("Gagal hapus file lama di MinIO"); }
      }
    }

    const result = await pool.query(
      `UPDATE posts 
       SET judul=$1, isi=$2, category_id=$3, gambar=$4 
       WHERE id=$5 RETURNING *`,
      [judul.trim(), isi.trim(), category_id, finalImageName, id]
    );

    res.json({ 
      status: 'success', 
      message: 'Post berhasil diupdate! 🪄',
      data: {
        ...result.rows[0],
        gambar: getPublicUrl(result.rows[0].gambar)
      } 
    });
  } catch (err) { 
    console.error('❌ ERROR UPDATE:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};
/* =========================
   DELETE POST
========================= */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await pool.query('SELECT gambar FROM posts WHERE id=$1', [id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Post tidak ditemukan' });
    }

    const { gambar } = post.rows[0];
    const bucketName = process.env.MINIO_BUCKET_NAME;

    await pool.query('DELETE FROM posts WHERE id=$1', [id]);

    if (gambar) {
      try {
        await minioClient.removeObject(bucketName, gambar);
      } catch (minioErr) {
        console.error('Gagal menghapus gambar di MinIO:', minioErr.message);
      }
    }

    res.json({ status: 'success', message: 'Data dan gambar berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET SINGLE POST BY ID
========================= */
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name 
       FROM posts p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Post tidak ditemukan' });
    }

    const postData = result.rows[0];
    res.json({
      status: 'success',
      data: {
        ...postData,
        gambar: postData.gambar ? getPublicUrl(postData.gambar) : null
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/* =========================
   TOGGLE FAVORITE
========================= */
exports.toggleFavorite = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;

  try {
    const checkFavorite = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (checkFavorite.rows.length > 0) {
      await pool.query(
        'DELETE FROM favorites WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      );
      return res.json({ status: 'success', message: 'Dihapus dari favorit', isFavorited: false });
    } else {
      await pool.query(
        'INSERT INTO favorites (user_id, post_id) VALUES ($1, $2)',
        [userId, postId]
      );
      return res.json({ status: 'success', message: 'Ditambahkan ke favorit', isFavorited: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;