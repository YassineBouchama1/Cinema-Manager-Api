const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validator');


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

exports.showTimeByIdValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Showtime ID'),

    validatorMiddleware,
];
