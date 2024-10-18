const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validator.middleware');

exports.createRatingValidator = [
    check('value')
        .notEmpty()
        .withMessage('Rating value is required')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5'),

    check('userId')
        .notEmpty()
        .isMongoId()
        .withMessage('User ID is required'),

    check('movieId')
        .notEmpty()
        .isMongoId()
        .withMessage('Movie ID is required'),

    validatorMiddleware,
];

exports.ratingByIdValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Rating ID'),

    validatorMiddleware,
];