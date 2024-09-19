const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const expressAsyncHandler = require('express-async-handler')
const userModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');



const JWT_SECRET = process.env.JWT_SECRET

// create token by passing id user
const createToken = (payload) => jwt.sign({ ...payload }, JWT_SECRET)



// @desc    mark task is done
// @route   PUT /api/v1/auth/signup
// @access  public
exports.signUp = expressAsyncHandler(async (req, res, next) => {

    try {

        const salt = await bcrypt.genSaltSync(10);

        //1 create user 
        const user = await userModel.create({

            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, salt)
        })



        res.status(201).json({ data: user })

    } catch (error) {
        return next(new ApiError(`Error Creating Account Procc: ${error.message}`, 500));
    }
})


// @desc    mark task is done
// @route   PUT /api/v1/auth/login
// @access  public
exports.login = expressAsyncHandler(async (req, res, next) => {

    try {
        //1 check if user aleady has account

        const user = await userModel.findOne({ email: req.body.email })

        // 2 - match token
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {

            return next(new ApiError(`email or passowrd uncourrect`, 404));
        }

        //3 creeate token 
        const token = await createToken(user._id)

        res.status(200).json({ data: user, token })
    } catch (error) {
        return next(new ApiError(`Error Login Procc: ${error.message}`, 500));
    }

})

