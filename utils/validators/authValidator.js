const { check } = require('express-validator');

const validatormiddleware = require('../../middlewares/validatormiddleware')
const User = require('../../models/userModel')



// validate fileds
exports.createAuthalidator = [
    check('name')
        .notEmpty()
        .withMessage('name required')
        .isLength({ min: 3 })
        .withMessage('Too short name')
    ,

    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address')
        .custom((val) =>
            User.findOne({ email: val }).then((user) => {
                if (user) {
                    return Promise.reject(new Error('E-mail already Exist in user'));
                }
            })
        ),

    check('password')
        .notEmpty()
        .withMessage('Password required')
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


    validatormiddleware,
];



exports.LoginAuthalidator = [


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

    validatormiddleware,
];
