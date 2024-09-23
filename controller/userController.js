
const expressAsyncHandler = require('express-async-handler')
const CinemaModel = require('../models/cinemaModel');
const ApiError = require('../utils/ApiError');
const NodeDaoMongodb = require('../service/node-dao-mongodb');

const dotenv = require('dotenv');
const UserModel = require('../models/userModel');
dotenv.config({ path: '.env' })


// get instance from service object
const nodeDaoMongodb = NodeDaoMongodb.getInstance();










// @desc    mark task is done
// @route   DELETE /api/v1/user
// @access  Private /user & admin
exports.deleteUser = expressAsyncHandler(async (req, res, next) => {

    let userId;

    // check if id is passed in params
    if (req.user.role === 'admin' && req.params.id) {
        userId = req.params.id;
    }

    // if the user is not an admin but is authenticated
    else if (req.user && req.user.role !== 'super') {
        userId = req.user.userId;
    }


    // If neither condition is met return an error
    else {
        return next(new ApiError('User ID is required or you must be an authenticated admin', 400));
    }


    try {
        // change status user 
        const userResult = await nodeDaoMongodb.findOneAndUpdate(
            UserModel,
            { _id: userId },
            { isDeleted: true },
            { new: false }
        );

        if (userResult?.error) {
            return next(new ApiError(`Error Change Status : ${userResult.error}`, 500));
        }

        if (!userResult.data) {
            return next(new ApiError(`User with id ${id} not found`, 404));
        }



        res.status(200).json({
            message: "User Status Changed ",
            cinema: userResult.data,
            usersAffected: usersResult.data.modifiedCount
        });
    } catch (error) {

        return next(new ApiError(`Error in Changing Status Operation: ${error.message}`, 500));
    }
});









// @desc    mark task is done
// @route   GET /api/v1/user/:id
// @access  Private
exports.viewUser = expressAsyncHandler(async (req, res, next) => {
    let userId;

    // check if id is passed in params
    if (req.user.role === 'admin' && req.params.id) {
        userId = req.params.id;
    }


    // if the user is not an admin but is authenticated
    else if (req.user && req.user.role !== 'super') {
        userId = req.user.userId;
    }

    // If neither condition is met return an error
    else {
        return next(new ApiError('User ID is required or you must be an authenticated admin', 400));
    }


    try {
        const result = await nodeDaoMongodb.findOne(UserModel, { _id: userId, isDeleted: false });

        if (!result || !result.data) {
            return next(new ApiError(`No User found with this ID`, 404));
        }

        if (result.error) {
            return next(new ApiError(`Error Fetching User: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
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

        res.status(201).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Cinema: ${error.message}`, 500));
    }
});



// @desc    users belong cinema
// @route   GET /api/v1/users
// @access  Private : super admin
exports.viewUsers = expressAsyncHandler(async (req, res, next) => {


    try {

        const result = await nodeDaoMongodb.select(UserModel);

        if (result?.error) {
            return next(new ApiError(`Error Fetching Cinemas: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Cinema: ${error.message}`, 500));
    }
});

