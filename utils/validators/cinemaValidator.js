const { check } = require('express-validator');

const validatormiddleware = require('../../middlewares/validator')
const User = require('../../models/userModel')

// validate fileds
exports.createCinemaValidator = [
    check('name')
        .notEmpty()
        .withMessage('name is required')
        .isLength({ min: 3 })
        .withMessage('Too short name')
        .custom((val) =>
            // check if name exist if not return error
            User.findOne({ name: val }).then((user) => {
                if (user) {
                    return Promise.reject(new Error('name already Exist in user'));
                }
            })
        ),


    validatormiddleware,
];
