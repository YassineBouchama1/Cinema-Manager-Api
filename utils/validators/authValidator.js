const { check } = require('express-validator');

const validatormiddleware = require('../../middlewares/validator')
const User = require('../../models/userModel');
const CinemaModel = require('../../models/cinemaModel');



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
    check('role')
        .custom((val) => {
            const rolesAllowed = ['user', 'admin'];
            // check if role is included in the allowed roles
            if (val && !rolesAllowed.includes(val)) {
                throw new Error('Invalid role');
            }
            return true; // return true if the role is valid or not passed
        })
        .optional({ checkFalsy: true }),
    check('cinemaName')
        .custom((cinemaName, { req }) => {
            // check if cinemaName is required when the role is admin
            if (req.body.role === 'admin' && !cinemaName) {
                throw new Error('Cinema name is required for admins');
            }

            // ceck if cinemaName already exists
            return CinemaModel.findOne({ name: cinemaName }).then((cinema) => {
                if (cinema) {
                    return Promise.reject(new Error('Cinema name already exists'));
                }
            });
        })
        .optional({ checkFalsy: true }),
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

    validatormiddleware,
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

    validatormiddleware,
];


exports.resetPassValidator = [

    check('password')
        .notEmpty()
        .withMessage('new Password required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    validatormiddleware,
]


exports.forgetPassValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address'),
    validatormiddleware,

]
