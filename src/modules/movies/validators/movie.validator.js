const { check } = require('express-validator');
const validatormiddleware = require('../middleware/validator.middleware')

exports.createMovieValidator = [
    check('name')
        .notEmpty()
        .withMessage('Movie name is required')
        .isLength({ min: 1 })
        .withMessage('Movie name is too short'),

    check('duration')
        .notEmpty()
        .withMessage('Duration is required')
        .isLength({ min: 1 })
        .withMessage('Duration is too short'),

    check('genre')
        .notEmpty()
        .withMessage('genre is required')
        .isIn(['action', 'comedy', 'drama', 'horror', 'romance', 'thriller', 'animation'])
        .withMessage('Invalid category'),


    // custom validation for the image file
    check('image').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('Image is required');
        }

        const file = req.file;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        // check file type
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error("Invalid file type. Only JPG, PNG, and GIF are allowed");
        }

        // check file size
        const maxSize = 2 * 1024 * 1024; // 2m
        if (file.size > maxSize) {
            throw new Error('File size should not exceed 2MB');
        }

        return true; // Return true  if all passs
    }),

    validatormiddleware,
];

exports.movieByIdValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Movie ID'),

    validatormiddleware,
];
