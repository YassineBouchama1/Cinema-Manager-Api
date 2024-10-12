const { check } = require('express-validator');
const validatorMiddleware = require('../../../middleware/validator.middleware');

// Validate fields for creating a room
exports.createRoomValidator = [
    check('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2 })
        .withMessage('Too short name'),

    check('capacity')
        .notEmpty()
        .withMessage('Capacity is required')
        .isNumeric()
        .withMessage('Capacity should be a number')
        .custom((val) => {
            if (val < 4) {
                throw new Error('Capacity is too low, must be more than 4 seats');
            }
            return true;
        }),

    check('seatsPerRow')
        .notEmpty()
        .withMessage('Seats per row is required')
        .isNumeric()
        .withMessage('Seats per row should be a number')
        .custom((val) => {
            if (val < 4) {
                throw new Error('Seats per row is too low, must be more than 4');
            }
            return true;
        }),

    check('type')
        .notEmpty()
        .withMessage('Type is required')
        .isLength({ min: 3 })
        .withMessage('Too short type'),

    validatorMiddleware,
];

// Validate fields for updating a room
exports.updateRoomValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid ID'),

    check('name')
        .optional()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2 })
        .withMessage('Too short name'),

    check('capacity')
        .optional()
        .notEmpty()
        .withMessage('Capacity is required')
        .isNumeric()
        .withMessage('Capacity should be a number')
        .custom((val) => {
            if (val < 4) {
                throw new Error('Capacity is too low, must be more than 4 seats');
            }
            return true;
        }),

    check('seatsPerRow')
        .optional()
        .notEmpty()
        .withMessage('Seats per row is required')
        .isNumeric()
        .withMessage('Seats per row should be a number')
        .custom((val) => {
            if (val < 4) {
                throw new Error('Seats per row is too low, must be more than 4');
            }
            return true;
        }),

    check('type')
        .optional()
        .notEmpty()
        .withMessage('Type is required')
        .isLength({ min: 3 })
        .withMessage('Too short type'),

    validatorMiddleware,
];

// Validate room by ID
exports.roomByIdValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid ID'),

    validatorMiddleware,
];