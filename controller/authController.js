const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const expressAsyncHandler = require('express-async-handler')
const UserModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');
const NodeDaoMongodb = require('../service/node-dao-mongodb');


const sendEmail = require('../utils/email/sendEmail');
const { forgetPasswordTemplate } = require('../utils/email/templates/forgetPasswordTemplate');
const dotenv = require('dotenv');
const { config } = require('../config');
dotenv.config({ path: '.env' });


// get instance from service object
const nodeDaoMongodb = NodeDaoMongodb.getInstance();
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET





// create token by passing id user
const createToken = (payload, expiresIn = '30d') => jwt.sign(payload, JWT_SECRET, { expiresIn })




// @desc    mark task is done
// @route   PUT /api/v1/auth/register
// @access  public
exports.register = expressAsyncHandler(async (req, res, next) => {
    try {
        const salt = await bcrypt.genSalt(10);

        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, salt),
            role: req.body.role
        };

        const result = await nodeDaoMongodb.insert(UserModel, userData);

        if (result?.error) {
            return next(new ApiError(`Error Creating Account: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Creating Account: ${error.message}`, 500));
    }
});







// @desc    mark task is done
// @route   PUT /api/v1/auth/login
// @access  public
exports.login = expressAsyncHandler(async (req, res, next) => {
    try {
        // 1. check if user already has an account
        const result = await nodeDaoMongodb.findOne(UserModel, { email: req.body.email });

        if (result?.error) {
            return next(new ApiError(`Error finding user: ${result.error}`, 500));
        }

        const user = result.data;

        // 2. Match password
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return next(new ApiError(`Email or password incorrect`, 401));
        }


        // 3. create token
        const token = await createToken({ userId: user.id });

        res.status(200).json({ data: user, token });
    } catch (error) {
        return next(new ApiError(`Error in Login Process: ${error.message}`, 500));
    }
});







// @desc    chnage password
// @route   PUT /api/v1/auth/reset
// @access  public
exports.resetPassword = expressAsyncHandler(async (req, res, next) => {
    try {

        // 1. check if user already has an account
        const result = await nodeDaoMongodb.findOne(UserModel, { _id: req.user._id });

        if (result?.error) {
            return next(new ApiError(`Error finding user: ${result.error}`, 500));
        }

        const user = result.data;

        // 2. check if user exist
        if (!user) {
            return next(new ApiError(`cant find this user`, 401));
        }


        // 3. update passowrd
        const salt = await bcrypt.genSalt(10);

        // new passowrd
        const userData = {
            password: await bcrypt.hash(req.body.password, salt),
        };

        const passwordUpdated = await nodeDaoMongodb.update(UserModel, { _id: req.user._id }, userData);


        if (passwordUpdated?.error) {
            return next(new ApiError(`Error password update : ${passwordUpdated.error}`, 500));
        }

        res.status(201).json({ message: 'Password Updated' });
    } catch (error) {
        return next(new ApiError(`Error Creating Account: ${error.message}`, 500));
    }
});





// @desc    Forget password
// @route   PUT /api/v1/auth/forget
// @access  public
exports.forgetPassword = expressAsyncHandler(async (req, res, next) => {
    try {

        // 1. check if user already has an account
        const result = await nodeDaoMongodb.findOne(UserModel, { email: req.body.email });

        if (result?.error) {
            return next(new ApiError(`Error finding user: ${result.error}`, 500));
        }


        const user = result.data;

        // 2. check if user exist
        if (!user) {
            // return next(new ApiError(`cant find this user`, 401));
            return res.status(201).json({ message: 'if this account exist should be recive email' });
        }


        // 3. create token to use it in forget pass 
        // expired in 1 hours
        const token = await createToken({ userId: user.id }, '1h');

        const url = `${config.host}/api/v1/auth/reset?forget=${token}`


        const html = await forgetPasswordTemplate(url, user.name)

        // send email
        const isEmailSent = await sendEmail({ email: user.email, html, subject: 'forget password' })


        // chekc if email sent
        if (!isEmailSent.success) {
            return next(new ApiError(`Error sending email: ${result.error}`, 500));
        }


        res.status(201).json({ message: 'if this account exist should be recive email' });
    } catch (error) {
        return next(new ApiError(`Error Creating Account: ${error.message}`, 500));
    }
});


