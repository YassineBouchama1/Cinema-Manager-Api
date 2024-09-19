const express = require('express')
const { signUp, login } = require('../controller/authController')
const { createAuthalidator, LoginAuthalidator } = require('../utils/validators/authValidator')


const router = express.Router()


//@access  : Pouplic
router.route('/signup')
    .post(createAuthalidator, signUp)

//@access  : Pouplic
router.route('/login')
    .post(LoginAuthalidator, login)









module.exports = router