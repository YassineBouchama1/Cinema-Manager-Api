const express = require('express')
const { login, resetPassword, register, forgetPassword } = require('../controller/authController')
const { createAuthValidator, LoginAuthValidator, resetPassValidator, forgetPassValidator } = require('../validators/authValidator')
const { protect } = require('../middlewares/guard')


const router = express.Router()


//@access  : public
router.route('/register')
    .post(createAuthValidator, register)


//@access  : public
router.route('/login')
    .post(LoginAuthValidator, login)


//@access  : private
router.route('/reset')
    .put(resetPassValidator, protect, resetPassword)



//@access  : public
router.route('/forget')
    .post(forgetPassValidator, forgetPassword)











module.exports = router