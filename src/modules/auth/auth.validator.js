const { check } = require('express-validator');
const User = require('../users/user.model');
const validatorMiddleware = require('../../middleware/validator.middleware');




// validate fileds
exports.createAuthValidator = [
    check('name')
        .notEmpty()
        .withMessage('name is required')
        .isLength({ min: 2 })
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



exports.LoginAuthValidator = [


    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address')

    ,
    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')

    ,

    validatorMiddleware,
];


exports.resetPassValidator = [

    check('password')
        .notEmpty()
        .withMessage('new Password required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    check('oldPassword')
        .notEmpty()
        .withMessage('Password confirmation required'),
    //     .custom((password, { req }) => {
    //         if (password !== req.body.passwordConfirm) {
    //             throw new Error('Password Confirmation incorrect');
    //         }
    //         return true;
    //     }),

    // check('oldPassword')
    //     .notEmpty()
    //     .withMessage('Password confirmation required'),

    validatorMiddleware,
]


exports.forgetPassValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address'),
    validatorMiddleware,

]
