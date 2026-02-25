require('dotenv').config();

const express = require('express');
const path = require('path');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const { minioClient, initBucket } = require('./config/minio'); 

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'public/images')));


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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', authRoutes);
app.use('/api', postRoutes);
app.use('/api', categoryRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message
  });
});


initBucket()
  .then(() => {
    console.log('MinIO bucket ready');
    app.listen(3000, () => {
      console.log('Server jalan di http://localhost:3000');
      console.log('Swagger di http://localhost:3000/api-docs');
    });
  })
  .catch(err => {
    console.error('❌ GAGAL TERHUBUNG KE MINIO:');
    console.error('Pastikan server MinIO sudah dinyalakan pada port 9000.');
    // Jangan hentikan proses jika ingin tetap menjalankan API lainnya
    // process.exit(1); 
  });