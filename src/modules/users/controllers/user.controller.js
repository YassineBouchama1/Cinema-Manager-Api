
const expressAsyncHandler = require('express-async-handler')
const ApiError = require('../../../utils/ApiError');
const dbOps = require('../../../utils/DatabaseOperations');
const dotenv = require('dotenv');
const User = require('../models/user.model');
dotenv.config({ path: '../../../../.env' })










// @desc    mark task is done
// @route   DELETE /api/v1/user
// @access  Private /user & admin
exports.deleteUser = expressAsyncHandler(async (req, res, next) => {


    const { id } = req.params

    try {



        // check if user exist
        const userIsExist = await dbOps.findOne(
            User,
            { _id: id },

        );


        if (!userIsExist.data) {
            return next(new ApiError(`There is no user Belong this Id `, 500));

        }

        let userExist = userIsExist.data


        // check if user belong same cinema admin or  this is super admin
        if (userExist.cinemaId !== req.user.cinemaId && req.user.role !== 'super') {
            return next(new ApiError('You are not allowed to remove a user from another cinema', 403));
        }


        // change status user 
        const userResult = await dbOps.update(
            User,
            { _id: req.userId },
            { isDeleted: true }
        );

        if (userResult?.error) {
            return next(new ApiError(`Error Change Status : ${userResult.error}`, 500));
        }




        res.status(200).json({
            message: "User Deleted Changed ",

        });
    } catch (error) {

        return next(new ApiError(`Error in Deleting Operation: ${error.message}`, 500));
    }
});




// @desc    mark task is done
// @route   PUT /api/v1/user
// @access  Private  admin
exports.updateUser = expressAsyncHandler(async (req, res, next) => {


    const { id } = req.params

    try {


        // check if user exist
        const userIsExist = await dbOps.findOne(
            User,
            { _id: id },

        );

        if (!userIsExist.data) {
            return next(new ApiError(`Error finding user: ${userIsExist.error}`, 500));

        }


        // update user
        const userResult = await dbOps.update(
            User,
            { _id: req.userId },
            req.body
        );

        // If there is an error updating the user
        if (userResult?.error) {
            return next(new ApiError(`There is no user Belong this Id || or there is errr `, 500));
        }


        res.status(200).json({
            message: "User Updated Changed ",
        });
    } catch (error) {

        return next(new ApiError(`Error in Updating Operation: ${error.message}`, 500));
    }
});





// @desc    update profile user with all roles with token
// @route   PUT /api/v1/user
// @access  Private /user & admin
exports.updateMyProfile = expressAsyncHandler(async (req, res, next) => {


    try {


        // update user
        const userUpdated = await dbOps.update(
            User,
            { _id: req.user._id },
            req.body
        );

        // If there is an error updating the user
        if (userUpdated?.error) {
            return next(new ApiError(`There is no user Belong this Id || or there is errr `, 500));
        }


        res.status(200).json(userUpdated);
    } catch (error) {

        return next(new ApiError(`Error in Updating Operation: ${error.message}`, 500));
    }
});








// @desc    mark task is done
// @route   GET /api/v1/user/:id
// @access  public
exports.viewUser = expressAsyncHandler(async (req, res, next) => {


    const { id } = req.params

    try {
        const userExist = await dbOps.findOne(User, { _id: id });

        if (!userExist || !userExist.data) {
            return next(new ApiError(`No User found with this ID`, 404));
        }


        if (userExist.error) {
            return next(new ApiError(`Error Fetching User: ${userExist.error}`, 500));
        }



        res.status(200).json({ data: userExist.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching User: ${error.message}`, 500));
    }
});





// @desc    get profile inofo of authed user
// @route   GET /api/v1/user/me
// @access  private
exports.myProfile = expressAsyncHandler(async (req, res, next) => {




    try {



        res.status(200).json({ data: req.user });
    } catch (error) {
        return next(new ApiError(`Error Fetching User: ${error.message}`, 500));
    }
});












// @desc    view all users 
// @route   GET /api/v1/users
// @access  Private : super admin
exports.viewUsers = expressAsyncHandler(async (req, res, next) => {



    try {

        // display users
        const conditions = {
            role: "user"
        }

        const result = await dbOps.select(User, conditions);

        if (result?.error) {
            return next(new ApiError(`Error Fetching Cinemas: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Cinema: ${error.message}`, 500));
    }
});










