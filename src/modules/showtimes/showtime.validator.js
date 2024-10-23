const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validator.middleware');

// validate fields for creating a showtime
exports.createShowTimeValidator = [
    check('price')
        .notEmpty()
        .withMessage('Price is required')
        .isNumeric()
        .withMessage('Price must be a number'),

    check('movieId')
        .notEmpty()
        .withMessage('Movie ID is required')
        .isMongoId()
        .withMessage('Invalid Movie ID'),

    check('roomId')
        .notEmpty()
        .withMessage('Room ID is required')
        .isMongoId()
        .withMessage('Invalid Room ID'),

    check('startAt')
        .notEmpty()
        .withMessage('Start time is required')
        .isISO8601()
        .withMessage('Invalid start time format. Use ISO 8601 format.'),

    validatorMiddleware,
];

// Validate fields for updating a showtime
exports.updateShowTimeValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Showtime ID'),

    check('price')
        .optional()
        .notEmpty()
        .withMessage('Price is required')
        .isNumeric()
        .withMessage('Price must be a number'),

    check('movieId')
        .optional()
        .notEmpty()
        .withMessage('Movie ID is required')
        .isMongoId()
        .withMessage('Invalid Movie ID'),

    check('roomId')
        .optional()
        .notEmpty()
        .withMessage('Room ID is required')
        .isMongoId()
        .withMessage('Invalid Room ID'),

    check('startAt')
        .optional()
        .notEmpty()
        .withMessage('Start time is required')
        .isISO8601()
        .withMessage('Invalid start time format. Use ISO 8601 format.'),

    validatorMiddleware,
];

// Validate showtime by ID
exports.showTimeByIdValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Showtime ID'),

    validatorMiddleware,
];