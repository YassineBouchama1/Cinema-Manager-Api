const Minio = require('minio');



const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

module.exports = minioClient;