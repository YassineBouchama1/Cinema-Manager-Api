
const expressAsyncHandler = require('express-async-handler')
const CinemaModel = require('../models/cinemaModel');
const ApiError = require('../utils/ApiError');
const NodeDaoMongodb = require('../service/node-dao-mongodb');

const dotenv = require('dotenv');
const UserModel = require('../models/userModel');
dotenv.config({ path: '.env' })


// get instance from service object
const nodeDaoMongodb = NodeDaoMongodb.getInstance();





// middleware to determine user ID based on roles
// TODO: Will reafactore it
const determineUserId = expressAsyncHandler(async (req, res, next) => {
    let userId;



    // super admin can edit any user
    if (req.user.role === 'super' && req.params.id) {
        userId = req.params.id;
    }
    // admin must specify which user they want to edit
    else if (req.user.role === 'admin' && req.params.id) {
        userId = req.params.id;
    }
    // regular user can only edit their own profile
    else if (req.user) {
        userId = req.user.userId;
    } else {
        return next(new ApiError('User ID is required or you must be an authenticated admin', 400));
    }

    // assign userId to request object
    return userId;


});




// @desc    mark task is done
// @route   DELETE /api/v1/user
// @access  Private /user & admin
exports.deleteUser = expressAsyncHandler(async (req, res, next) => {


    const { id } = req.params

    try {



        // check if user exist
        const userIsExist = await nodeDaoMongodb.findOne(
            UserModel,
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
        const userResult = await nodeDaoMongodb.update(
            UserModel,
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
// @access  Private /user & admin
exports.updateUser = expressAsyncHandler(async (req, res, next) => {


    const { id } = req.params

    try {


        // check if user exist
        const userIsExist = await nodeDaoMongodb.findOne(
            UserModel,
            { _id: id },

        );


        if (!userIsExist.data) {
            return next(new ApiError(`Error finding user: ${userIsExist.error}`, 500));

        }

        let userExist = userIsExist.data



        // check if user belong same cinema admin or  this is super admin
        if (req.user.role === 'admin' && userExist.cinemaId.toString() !== req.user.cinemaId.toString()) {
            return next(new ApiError('You are not allowed to update a user from another cinema', 403));
        }



        // update user
        const userResult = await nodeDaoMongodb.update(
            UserModel,
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



// @desc    mark task is done
// @route   PUT /api/v1/user
// @access  Private /user & admin
exports.updateMyProfile = expressAsyncHandler(async (req, res, next) => {


    const { id } = req.user


    try {


        // check if user exist
        const userIsExist = await nodeDaoMongodb.findOne(
            UserModel,
            { _id: id },

        );

        if (!userIsExist.data) {
            return next(new ApiError(`there is no user belong this id: ${userIsExist.error}`, 500));

        }

        let userExist = userIsExist.data


        // update user
        const userUpdated = await nodeDaoMongodb.update(
            UserModel,
            { _id: userExist.id },
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
// @access  Private
exports.viewUser = expressAsyncHandler(async (req, res, next) => {


    const { id } = req.params

    try {
        const userExist = await nodeDaoMongodb.findOne(UserModel, { _id: id, isDeleted: false });

        if (!userExist || !userExist.data) {
            return next(new ApiError(`No User found with this ID`, 404));
        }


        if (userExist.error) {
            return next(new ApiError(`Error Fetching User: ${userExist.error}`, 500));
        }


        // check if user belong same cinema admin or  this is super admin 
        if (req.user.role === 'admin' && userExist.cinemaId !== req.user.cinemaId) {
            return next(new ApiError('You are not allowed to update a user from another cinema', 403));
        }



        res.status(200).json({ data: userExist.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching User: ${error.message}`, 500));
    }
});









// @desc    users belong cinema
// @route   GET /api/v1/users
// @access  Private
exports.usersBelongCinema = expressAsyncHandler(async (req, res, next) => {

    //get cinemaId authed user that belong cinema
    const { cinemaId } = req.user
    try {

        const result = await nodeDaoMongodb.select(UserModel, { cinemaId, isDeleted: false });

        if (result?.error) {
            return next(new ApiError(`Error Fetching Cinemas: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Cinema: ${error.message}`, 500));
    }
});



// @desc    users belong cinema
// @route   GET /api/v1/users
// @access  Private : super admin
exports.viewUsers = expressAsyncHandler(async (req, res, next) => {


    const { role, cinemaId } = req.user

    try {

        // if  request from super admin bring all users 
        // if admin bring users belong same cinema admin 
        const conditions = role === 'admin' ? { cinemaId } : {}

        const result = await nodeDaoMongodb.select(UserModel, conditions);

        if (result?.error) {
            return next(new ApiError(`Error Fetching Cinemas: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Cinema: ${error.message}`, 500));
    }
});










