const { check } = require('express-validator');
const validatorMiddleware = require('../../../middleware/validator.middleware');

exports.createCommentValidator = [
    check('text')
        .notEmpty()
        .withMessage('Comment text is required')
        .isLength({ min: 2 })
        .withMessage('Comment text is too short'),

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

exports.commentByIdValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Comment ID'),

    validatorMiddleware,
];