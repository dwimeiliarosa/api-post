const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_USE_SSL === 'true', 
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

const initBucket = async () => {
    const bucket = process.env.MINIO_BUCKET_NAME;
    
    try {
        const exists = await minioClient.bucketExists(bucket);
        
        if (!exists) {
            await minioClient.makeBucket(bucket);
            console.log(`Bucket ${bucket} berhasil dibuat`);
        }

        // --- KODE PERBAIKAN DI SINI ---
        // Policy ini memberikan akses ke level bucket dan level file
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    // Statement 1: Izin akses ke level Bucket (Agar status jadi PUBLIC)
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: [
                        "s3:GetBucketLocation", 
                        "s3:ListBucket"
                    ],
                    Resource: [`arn:aws:s3:::${bucket}`],
                },
                {
                    // Statement 2: Izin akses ke isi file di dalam bucket
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${bucket}/*`],
                },
            ],
        };

        // Menerapkan policy ke bucket agar label di dashboard berubah jadi PUBLIC
        await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
        console.log(`✅ Policy PUBLIC read-only diterapkan pada bucket: ${bucket}`);
        // ------------------------------

    } catch (err) {
        console.error('❌ Terjadi kesalahan pada Init Bucket:', err.message);
    }
};

initBucket();

module.exports = { minioClient, initBucket };