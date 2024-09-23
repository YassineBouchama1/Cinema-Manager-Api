
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



    // there is middle ware determin userId

    try {



        // check if user exist
        const userIsExist = await nodeDaoMongodb.findOne(
            UserModel,
            { _id: req.userId },

        );


        if (!userIsExist.data) {
            return next(new ApiError(`There is no user Belong this Id `, 500));

        }

        let userExist = userIsExist.data
        console.log(req.user)

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




    try {


        // check if user exist
        const userIsExist = await nodeDaoMongodb.findOne(
            UserModel,
            { _id: req.userId },

        );


        if (!userIsExist.data) {
            return next(new ApiError(`Error finding user: ${userIsExist.error}`, 500));

        }

        let userExist = userIsExist.data
        console.log(req.user)


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
// @route   GET /api/v1/user/:id
// @access  Private
exports.viewUser = expressAsyncHandler(async (req, res, next) => {


    // check if id is passed in params
    if (req.user.role === 'admin' && req.params.id) {
        req.userId = req.params.id;
    }


    // if the user is not an admin but is authenticated
    else if (req.user && req.user.role !== 'super') {
        req.userId = req.user.userId;
    }

    // If neither condition is met return an error
    else {
        return next(new ApiError('User ID is required or you must be an authenticated admin', 400));
    }


    try {
        const result = await nodeDaoMongodb.findOne(UserModel, { _id: req.userId, isDeleted: false });

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


    const { role, cinemaId } = req.user

    try {

        // if  request from super admin bring all users 
        // if admin bring users belong same cinema admin 
        const conditions = role === 'admin' ? { cinemaId } : {}

        const result = await nodeDaoMongodb.select(UserModel, conditions);

        if (result?.error) {
            return next(new ApiError(`Error Fetching Cinemas: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Cinema: ${error.message}`, 500));
    }
});

