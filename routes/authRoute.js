const express = require('express')
const { signUp, login, reset } = require('../controller/authController')
const { createAuthValidator, LoginAuthValidator, resetPassValidator } = require('../utils/validators/authValidator')


const router = express.Router()


//@access  : public
router.route('/register')
    .post(createAuthValidator, signUp)

//@access  : public
router.route('/login')
    .post(LoginAuthValidator, login)

router.route('/reset')
    .post(resetPassValidator, reset)









module.exports = router