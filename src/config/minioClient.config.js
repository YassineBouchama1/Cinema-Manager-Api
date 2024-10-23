const Minio = require('minio');



const dotenv = require('dotenv');
dotenv.config({ path: '../../env' });

const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: process.env.NEXT_PUBLIC_MINIO_ACCESS_KEY,
    secretKey: process.env.NEXT_PUBLIC_MINIO_SECRET_KEY
});


// check if the bucket exists
minioClient.bucketExists('cinema', (err, exists) => {
    if (err) {
        return console.log('Error checking bucket existence:', err);
    }
    if (!exists) {


        // create the bucket if it doesnt exist
        minioClient.makeBucket('cinema', 'us-east-1', (err) => {
            if (err) return console.log('Error creating bucket:', err);
            console.log('Bucket created successfully.');
        });
    } else {
        console.log('Bucket already exists.');
    }
});

module.exports = minioClient; 