require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const { minioClient, initBucket } = require('./config/minio');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

const app = express();

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Logger Middleware (Diletakkan di atas agar mencatat semua request ke /api)
app.use('/api', (req, res, next) => {
  console.log(`[API LOG] ${new Date().toLocaleString()} - ${req.method} ${req.url}`);
  next();
});

// Proxy Image MinIO
app.get('/api/view-image/:filename', async (req, res) => {
  try {
    const stream = await minioClient.getObject(
      process.env.MINIO_BUCKET_NAME,
      req.params.filename
    );
    stream.pipe(res);
  } catch (err) {
    console.error('MinIO Get Error:', err);
    res.status(404).json({ message: 'File tidak ditemukan di MinIO' });
  }
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Registration of Routes
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);

app.use('/api/favorites', favoriteRoutes); // Favorit dipisah agar modular

app.use('/api', postRoutes);     // PostRoutes sekarang bersih dari log internal

// Debug: Cek Rute Aktif
app._router.stack.forEach(function(r) {
  if (r.route && r.route.path) {
    console.log("Rute Aktif:", r.route.path);
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message
  });
});

// Server Initialization
initBucket()
  .then(() => {
    console.log('✅ MinIO bucket ready');
    app.listen(3000, () => {
      console.log('🚀 Server jalan di http://localhost:3000');
      console.log('📚 Swagger di http://localhost:3000/api-docs');
    });
  })
  .catch(err => {
    console.error('❌ GAGAL TERHUBUNG KE MINIO:');
    console.error('Pastikan server MinIO sudah dinyalakan pada port 9000.');
  });