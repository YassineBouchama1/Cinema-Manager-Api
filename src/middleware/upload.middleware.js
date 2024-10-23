const multer = require('multer');


const storage = multer.memoryStorage();


const upload = multer({
    //   storage: storage,
    //   limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'image') {


            // acccept only image files
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Only image files are allowed for the image field'), false);
            }
        } else if (file.fieldname === 'video') {

            // accept only video files
            if (!file.mimetype.startsWith('video/')) {
                return cb(new Error('Only video files are allowed for the video field'), false);
            }
        }
        cb(null, true);
    }
}).fields([
    { name: 'image', maxCount: 1, limits: { fileSize: 5 * 1024 * 1024 } }, // added limit 5mb in image size
    { name: 'video', maxCount: 1 }
]);

module.exports = upload;