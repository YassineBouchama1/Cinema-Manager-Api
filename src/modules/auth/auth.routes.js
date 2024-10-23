const express = require('express')
const { createAuthValidator, LoginAuthValidator, resetPassValidator, forgetPassValidator } = require('./auth.validator')
const { register, login, resetPassword, forgetPassword } = require('./auth.controller')
const { protect, allowedTo } = require('../../middleware/auth.middleware')



const router = express.Router()


//@access  : public
router.route('/register')
    .post(createAuthValidator, register)


//@access  : public
router.route('/login')
    .post(LoginAuthValidator, login)


//@access  : private - public
router.route('/reset')
    .put(resetPassValidator, protect, resetPassword)



//@access  : public
router.route('/forget')
    .post(forgetPassValidator, forgetPassword)











module.exports = router