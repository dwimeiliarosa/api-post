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
    const exists = await minioClient.bucketExists(bucket);
    
    if (!exists) {
        await minioClient.makeBucket(bucket);
        console.log(`Bucket ${bucket} berhasil dibuat`);
    }

   

    const policy = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: { AWS: ["*"] },
                Action: ["s3:GetBucketLocation", "s3:ListBucket"],
                Resource: [`arn:aws:s3:::${bucket}`],
            },
            {
                Effect: "Allow",
                Principal: { AWS: ["*"] },
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${bucket}/*`],
            },
        ],
    };

    
    await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
    console.log(`Policy public read-only diterapkan pada bucket ${bucket}`);
};

initBucket();

module.exports = { minioClient, initBucket };