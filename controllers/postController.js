const pool = require('../config/db');
const sharp = require('sharp');
const { minioClient } = require('../config/minio');

const getPublicUrl = (fileName) => {
  const baseDomain = process.env.MINIO_PUBLIC_URL; // Pastikan ini ada di file .env
  const bucket = process.env.MINIO_BUCKET_NAME;
  
  return `${baseDomain}/${bucket}/${fileName}`;
};
/* =========================
   GET ALL POSTS
========================= */
exports.getPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.*, categories.name AS category_name
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      ORDER BY posts.id ASC
    `);

    // Mapping hasil query untuk mengubah nama file jadi URL
    const formattedData = result.rows.map(post => ({
      ...post,
      gambar: post.gambar ? getPublicUrl(post.gambar) : null,
      file: post.file ? getPublicUrl(post.file) : null
    }));

    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   CREATE POST (Sharp + MinIO)
========================= */
exports.createPost = async (req, res) => {
  try {
    const { judul, isi, category_id } = req.body;
    const gambar = req.files?.gambar?.[0];
    const fileUpload = req.files?.file?.[0];

    // 1. Validasi Input
    const errors = [];
    if (!judul?.trim()) errors.push('Judul wajib diisi');
    if (!isi?.trim()) errors.push('Isi wajib diisi');
    if (!gambar) errors.push('Gambar wajib diupload');
    if (!fileUpload) errors.push('File wajib diupload');
    if (!category_id) errors.push('Category wajib dipilih');

    if (errors.length > 0) {
      return res.status(400).json({ status: 'error', errors });
    }

    // 2. Cek apakah Kategori ada di DB
    const categoryCheck = await pool.query('SELECT * FROM categories WHERE id=$1', [category_id]);
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Category tidak ditemukan' });
    }

    const bucketName = process.env.MINIO_BUCKET_NAME;

    // 3. Olah Gambar dengan Sharp (Resize & Convert ke WebP)
    const optimizedImageName = `img-${Date.now()}.webp`;
    const optimizedImageBuffer = await sharp(gambar.buffer)
      .resize(800)
      .webp({ quality: 80 })
      .toBuffer();

    // 4. Upload ke MinIO
    // Upload Gambar Optimized
    await minioClient.putObject(bucketName, optimizedImageName, optimizedImageBuffer, {
      'Content-Type': 'image/webp'
    });

    // Upload File (PDF/Lainnya)
    const fileName = `file-${Date.now()}-${fileUpload.originalname.replace(/\s/g, '_')}`;
    await minioClient.putObject(bucketName, fileName, fileUpload.buffer, {
      'Content-Type': fileUpload.mimetype
    });

    // 5. Simpan Data ke Database
    const result = await pool.query(
      `INSERT INTO posts (judul, isi, gambar, file, category_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [judul.trim(), isi.trim(), optimizedImageName, fileName, category_id]
    );

    const postData = result.rows[0];
    const formattedData = {
    ...postData,
    gambar: postData.gambar ? getPublicUrl(postData.gambar) : null,
    file: postData.file ? getPublicUrl(postData.file) : null
};

    res.status(201).json({
    status: 'success',
    data: formattedData,
    message: 'Post berhasil dibuat dan disimpan di MinIO'
});

  } catch (err) {
    console.error('Error Create Post:', err);
    res.status(500).json({ status: 'error', message: err.message });
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
      return res.status(400).json({ status: 'error', message: 'Judul, isi dan category wajib diisi' });
    }

    const result = await pool.query(
      `UPDATE posts SET judul=$1, isi=$2, category_id=$3 WHERE id=$4 RETURNING *`,
      [judul.trim(), isi.trim(), category_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Post tidak ditemukan' });
    }

    const postData = result.rows[0];
    const formattedData = {
      ...postData,
      gambar: postData.gambar ? getPublicUrl(postData.gambar) : null,
      file: postData.file ? getPublicUrl(postData.file) : null
    };

    res.json({ 
      status: 'success', 
      data: formattedData 
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

    // Ambil info file untuk dihapus di MinIO juga
    const post = await pool.query('SELECT gambar, file FROM posts WHERE id=$1', [id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Post tidak ditemukan' });
    }

    const { gambar, file } = post.rows[0];
    const bucketName = process.env.MINIO_BUCKET_NAME;

    // Hapus dari Database
    await pool.query('DELETE FROM posts WHERE id=$1', [id]);

    // Hapus dari MinIO (Opsional tapi disarankan agar storage tidak penuh)
    try {
      await minioClient.removeObject(bucketName, gambar);
      await minioClient.removeObject(bucketName, file);
    } catch (minioErr) {
      console.error('Gagal menghapus file di MinIO:', minioErr.message);
    }

    res.json({ status: 'success', message: 'Data dan file berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};