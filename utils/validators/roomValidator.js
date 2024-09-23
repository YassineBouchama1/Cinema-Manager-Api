const { check } = require('express-validator');

const validatormiddleware = require('../../middlewares/validator')

// validate fileds
exports.createRoomValidator = [
    check('name')
        .notEmpty()
        .withMessage('name is required')
        .isLength({ min: 2 })
        .withMessage('Too short name')

    ,

    check('capacity')
        .notEmpty().withMessage('capacity is Required')
        .isNumeric().withMessage('capacity shouldbe number')
        .custom((val) => {
            if (val < 2) {
                throw new Error('capacity is to low make sure be more than 2 seats');
            }
            return true;
        })
    ,
    check('type')
        .notEmpty()
        .withMessage('type is required')
        .isLength({ min: 3 })
        .withMessage('Too short type')

    ,

    validatormiddleware,
];


exports.roomByIdValidator = [
    check('id')
        .isMongoId().withMessage('id Invalid')
    ,

    validatormiddleware,
]