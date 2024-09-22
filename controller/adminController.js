const bcrypt = require('bcryptjs');
const expressAsyncHandler = require('express-async-handler')
const UserModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');
const NodeDaoMongodb = require('../service/node-dao-mongodb');

const dotenv = require('dotenv')
dotenv.config({ path: '.env' })


// get instance from service object
const nodeDaoMongodb = NodeDaoMongodb.getInstance();







// @desc    mark task is done
// @route   PUT /api/v1/auth/register
// @access  private
exports.createAdmin = expressAsyncHandler(async (req, res, next) => {
    try {
        const salt = await bcrypt.genSalt(10);

        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, salt),
            role: 'admin'
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
