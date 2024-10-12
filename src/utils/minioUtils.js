const minioClient = require("../config/minioClient.config");
const ApiError = require("./ApiError");



const generateVideoPresignedUrl = (bucketName, objectName, expiry) => {
  return new Promise((resolve, reject) => {
    minioClient.presignedGetObject(bucketName, objectName, expiry, (err, url) => {
      if (err) {
        console.error(`Error generating pre-signed URL: ${err.message}`);
        return reject(new ApiError(`Error generating pre-signed URL: ${err.message}`, 500));
      }
      resolve(url);
    });
  });
};

module.exports = { generateVideoPresignedUrl };