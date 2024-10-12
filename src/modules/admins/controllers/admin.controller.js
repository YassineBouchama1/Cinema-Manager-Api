const bcrypt = require('bcryptjs');
const expressAsyncHandler = require('express-async-handler')
const ApiError = require('../../../utils/ApiError');
const dbOps = require('../../../utils/DatabaseOperations');
const dotenv = require('dotenv');
const User = require('../../users/models/user.model');
dotenv.config({ path: '../../../../.env' })










// @desc   create admin belong spicific cinema
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

        const result = await dbOps.insert(User, userData);

        if (result?.error) {
            return next(new ApiError(`Error Creating Account: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Creating Account: ${error.message}`, 500));
    }
});
