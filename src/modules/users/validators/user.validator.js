const { check } = require('express-validator');
const validatorMiddleware = require('../../../middleware/validator.middleware');

// validate fields
exports.updateUserValidator = [
    check('name')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 2 })
        .withMessage('Too short name'),

    check('password')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .custom((password, { req }) => {
            if (password && password !== req.body.passwordConfirm) {
                throw new Error('Password Confirmation incorrect');
            }
            return true;
        }),

    check('passwordConfirm')
        .optional({ nullable: true, checkFalsy: true })
    ,

    validatorMiddleware,
];