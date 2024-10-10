const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const expressAsyncHandler = require('express-async-handler')
const UserModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');
const dbOps = require('../utils/DatabaseOperations');

const sendEmail = require('../utils/email/sendEmail');
const { forgetPasswordTemplate } = require('../utils/email/templates/forgetPasswordTemplate');
const dotenv = require('dotenv');
const { config } = require('../config');
const CinemaModel = require('../models/cinemaModel');
const { createToken } = require('../utils/createToken');


dotenv.config({ path: '.env' });







// @desc    mark task is done
// @route   PUT /api/v1/auth/register
// @access  public
exports.register = expressAsyncHandler(async (req, res, next) => {
    const { name, email, password, role, cinemaName } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let userData = {
            name,
            email,
            password: hashedPassword,
            role
        };

        // if wany register as admin and not passed cinema name return error
        if (role === 'admin') {
            if (!cinemaName) {
                return next(new ApiError('Cinema name is required for admin registration', 400));
            }

            //1. create cinema 
            const cinemaData = { name: cinemaName };
            const cinemaResult = await dbOps.insert(CinemaModel, cinemaData);

            if (cinemaResult?.error) {
                return next(new ApiError(`Error Creating Cinema: ${cinemaResult.error}`, 500));
            }

            //2. ddd cinemaId to userData
            userData.cinemaId = cinemaResult.data._id;
        }

        //3. create user account
        const userResult = await dbOps.insert(UserModel, userData);

        if (userResult?.error) {
            // if there was a error creating the user and we created a cinem we should delete it
            if (role === 'admin' && userData.cinemaId) {
                await dbOps.deleteOne(CinemaModel, { _id: userData.cinemaId });
            }
            return next(new ApiError(`Error Creating Account: ${userResult.error}`, 500));
        }

        res.status(201).json({ data: userResult.data, message: 'Created Account Successfully' });
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
        const result = await dbOps.findOne(UserModel, { email: req.body.email });

        if (result?.error) {
            return next(new ApiError(`Error finding user: ${result.error}`, 500));
        }

        const user = result.data;




        // 2. Match password
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return next(new ApiError(`Email or password incorrect`, 401));
        }

        //3. check if user active 
        if (user?.isDeleted) {
            return next(new ApiError(`this Account Deleted Contact Admin : ${config.emailSmtp}`, 500));
        }

        // 4. create token
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
        const result = await dbOps.findOne(UserModel, { _id: req.user._id });

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

        const passwordUpdated = await dbOps.update(UserModel, { _id: req.user._id }, userData);


        if (passwordUpdated?.error) {
            // Log email error using the utility
            logEmailError({ userId: req.user._id, email: req.user.email, name: req.user.name, error: isEmailSent.error, category: 'Forget Password' });

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
        const result = await dbOps.findOne(UserModel, { email: req.body.email });

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

        const url = `${config.frontUrl}?tokenPass=${token}`


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


