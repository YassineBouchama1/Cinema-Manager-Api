const { check } = require('express-validator');

const validatorMiddleware = require('../../../middleware/validator.middleware');
const User = require('../../users/models/user.model');

// validate fileds
exports.createAdminValidator = [
    check('name')
        .notEmpty()
        .withMessage('name is required')
        .isLength({ min: 3 })
        .withMessage('Too short name')
    ,

    check('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address')
        .custom((val) =>
            // check if user exist if not return error
            User.findOne({ email: val }).then((user) => {
                if (user) {
                    return Promise.reject(new Error('E-mail already Exist in user'));
                }
            })
        ),

    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .custom((password, { req }) => {
            if (password !== req.body.passwordConfirm) {
                throw new Error('Password Confirmation incorrect');
            }
            return true;
        }),

    check('passwordConfirm')
        .notEmpty()
        .withMessage('Password confirmation required'),


    validatorMiddleware,
];
