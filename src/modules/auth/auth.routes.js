const express = require('express')
const { createAuthValidator, LoginAuthValidator, resetPassValidator, forgetPassValidator } = require('./auth.validator')
const { register, login, resetPassword, forgetPassword } = require('./auth.controller')
const { protect, allowedTo } = require('../../middleware/auth.middleware')


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created Account Successfully
 *       500:
 *         description: Error Creating Account
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Email or password incorrect
 */

/**
 * @swagger
 * /auth/reset:
 *   put:
 *     tags: [Auth]
 *     summary: Reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               oldPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password Updated
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /auth/forget:
 *   post:
 *     tags: [Auth]
 *     summary: Forget password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: If this account exists, an email will be sent
 */

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