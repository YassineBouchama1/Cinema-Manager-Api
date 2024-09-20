const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const expressAsyncHandler = require('express-async-handler')
const UserModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');
const NodeDaoMongodb = require('../config/node-dao-mongodb');

const nodeDaoMongodb = NodeDaoMongodb.getInstance();
const JWT_SECRET = process.env.JWT_SECRET





// create token by passing id user
const createToken = (payload) => jwt.sign({ ...payload }, JWT_SECRET)




// @desc    mark task is done
// @route   PUT /api/v1/auth/signup
// @access  public
exports.signUp = expressAsyncHandler(async (req, res, next) => {
    try {
        const salt = await bcrypt.genSalt(10);

        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, salt)
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

        console.log(user)
        // 3. create token
        const token = await createToken(user._id);

        res.status(200).json({ data: user, token });
    } catch (error) {
        return next(new ApiError(`Error in Login Process: ${error.message}`, 500));
    }
});






