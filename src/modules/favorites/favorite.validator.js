const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validator.middleware');

exports.addFavoriteValidator = [
    check('movieId')
        .notEmpty()
        .isMongoId()
        .withMessage('Movie ID is required'),
    
    validatorMiddleware,
];

exports.favoriteByIdValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Favorite ID'),

    validatorMiddleware,
];