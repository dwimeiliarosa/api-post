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
    const userId = req.user?.id || null; // Ambil ID user dari token (jika ada)

    const result = await pool.query(`
      SELECT 
        p.*, 
        c.name AS category_name, 
        u.nama AS author_name,
        -- Cek apakah post ini ada di tabel favorites milik user ini
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
  isFavorited: post.is_favorited // Mapping ke camelCase untuk Frontend
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
   CREATE POST (Hanya Gambar + Data)
========================= */
exports.createPost = async (req, res) => {
  try {
    console.log("--- DEBUGGING CREATE POST ---");
    console.log("User Data:", req.user); 
    console.log("Files yang diterima:", req.files); 
    console.log("Body data:", req.body); 
    console.log("-----------------------------");

    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Sesi tidak valid, silakan login kembali.' 
      });
    }

    const { judul, isi, category_id } = req.body;
    const gambar = req.files?.gambar?.[0]; // Hanya ambil gambar
    const userId = req.user.id;

    // 1. Validasi Input (File dihapus dari validasi)
    const errors = [];
    if (!judul?.trim()) errors.push('Judul wajib diisi');
    if (!isi?.trim()) errors.push('Isi wajib diisi');
    if (!gambar) errors.push('Gambar wajib diupload');
    if (!category_id) errors.push('Category wajib dipilih');

    if (errors.length > 0) {
      return res.status(400).json({ status: 'error', errors });
    }

    // 2. Cek apakah Kategori ada
    const categoryCheck = await pool.query('SELECT * FROM categories WHERE id=$1', [category_id]);
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Category tidak ditemukan' });
    }

    const bucketName = process.env.MINIO_BUCKET_NAME;

    // 3. Olah Gambar dengan Sharp
    const optimizedImageName = `img-${Date.now()}.webp`;
    const optimizedImageBuffer = await sharp(gambar.buffer)
      .resize(800)
      .webp({ quality: 80 })
      .toBuffer();

    // 4. Upload Gambar ke MinIO
    await minioClient.putObject(bucketName, optimizedImageName, optimizedImageBuffer, {
      'Content-Type': 'image/webp'
    });

    // 5. Simpan Data ke Database (Kolom 'file' diisi null atau kosong)
    const result = await pool.query(
      `INSERT INTO posts (judul, isi, gambar, category_id, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [judul.trim(), isi.trim(), optimizedImageName, category_id, userId]
    );

    const postData = result.rows[0];
    const formattedData = {
      ...postData,
      gambar: postData.gambar ? getPublicUrl(postData.gambar) : null
    };

    res.status(201).json({
      status: 'success',
      data: formattedData,
      message: 'Post berhasil dibuat tanpa lampiran file'
    });

  } catch (err) {
    console.error('Error Create Post:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/* =========================
   UPDATE POST FINAL
========================= */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, isi, category_id } = req.body;
    const newGambar = req.files?.gambar?.[0]; // Ambil file dari multer memoryStorage

    // 1. Ambil data lama untuk cek gambar lama
    const checkPost = await pool.query('SELECT gambar FROM posts WHERE id=$1', [id]);
    if (checkPost.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Post tidak ditemukan' });
    }

    let finalImageName = checkPost.rows[0].gambar; // Default pakai gambar lama

    // 2. Jika user upload gambar baru
    if (newGambar) {
      const bucketName = process.env.MINIO_BUCKET_NAME;
      finalImageName = `img-${Date.now()}.webp`;

      // Proses dengan Sharp
      const buffer = await sharp(newGambar.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toBuffer();

      // Upload ke MinIO
      await minioClient.putObject(bucketName, finalImageName, buffer, {
        'Content-Type': 'image/webp'
      });

      // (Opsional) Hapus gambar lama di MinIO agar storage tidak penuh
      if (checkPost.rows[0].gambar) {
        try {
          await minioClient.removeObject(bucketName, checkPost.rows[0].gambar);
        } catch (e) { console.error("Gagal hapus file lama di MinIO"); }
      }
    }

    // 3. UPDATE DATABASE (Sangat Penting: Pastikan kolom gambar masuk di sini)
    const result = await pool.query(
      `UPDATE posts 
       SET judul=$1, isi=$2, category_id=$3, gambar=$4 
       WHERE id=$5 RETURNING *`,
      [judul.trim(), isi.trim(), category_id, finalImageName, id]
    );

    res.json({ 
      status: 'success', 
      data: {
        ...result.rows[0],
        gambar: getPublicUrl(result.rows[0].gambar) // Kirim URL lengkap ke frontend
      } 
    });
  } catch (err) { 
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

    try {
      if (gambar) await minioClient.removeObject(bucketName, gambar);
    } catch (minioErr) {
      console.error('Gagal menghapus gambar di MinIO:', minioErr.message);
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
    const formattedData = {
      ...postData,
      // Penting: Generate URL publik agar gambar muncul di preview edit
      gambar: postData.gambar ? getPublicUrl(postData.gambar) : null
    };

    res.json({
      status: 'success',
      data: formattedData
    });
  } catch (err) {
    console.error('ERROR GET BY ID:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
};
exports.toggleFavorite = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;

  try {
    // 1. Cek apakah sudah ada di favorit
    const checkFavorite = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (checkFavorite.rows.length > 0) {
      // 2. Jika sudah ada, maka UNLIKE (Hapus)
      await pool.query(
        'DELETE FROM favorites WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      );
      return res.json({ status: 'success', message: 'Dihapus dari favorit', isFavorited: false });
    } else {
      // 3. Jika belum ada, maka LIKE (Tambah)
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