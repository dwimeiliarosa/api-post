const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: false, // set true jika menggunakan https
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

// Fungsi untuk memastikan bucket sudah ada
const initBucket = async () => {
    const bucket = process.env.MINIO_BUCKET_NAME;
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
        await minioClient.makeBucket(bucket);
        console.log(`Bucket ${bucket} berhasil dibuat`);
    }
};

initBucket();

module.exports = { minioClient, initBucket };