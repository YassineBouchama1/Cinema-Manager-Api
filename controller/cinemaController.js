
const expressAsyncHandler = require('express-async-handler')
const CinemaModel = require('../models/cinemaModel');
const ApiError = require('../utils/ApiError');
const NodeDaoMongodb = require('../service/node-dao-mongodb');

const dotenv = require('dotenv')
dotenv.config({ path: '.env' })


// get instance from service object
const nodeDaoMongodb = NodeDaoMongodb.getInstance();







// @desc    mark task is done
// @route   POST /api/v1/Cinema
// @access  Private
exports.createCinema = expressAsyncHandler(async (req, res, next) => {
    try {

        const result = await nodeDaoMongodb.insert(CinemaModel, req.body);

        if (result?.error) {
            return next(new ApiError(`Error Creating Cinema: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data, message: result.message });
    } catch (error) {
        return next(new ApiError(`Error Creating Cinema: ${error.message}`, 500));
    }
});



// @desc    mark task is done
// @route   DELETE /api/v1/Cinema
// @access  Private
exports.deleteCinema = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    try {
        // soft delete the cinema
        const cinemaResult = await nodeDaoMongodb.findOneAndUpdate(
            CinemaModel,
            { _id: id },
            { isDeleted: true },
            { new: false } // hna returns the document before update 
        );

        if (cinemaResult?.error) {
            return next(new ApiError(`Error Soft Deleting Cinema: ${cinemaResult.error}`, 500));
        }

        if (!cinemaResult.data) {
            return next(new ApiError(`Cinema with id ${id} not found`, 404));
        }

        // deactivate all users associated with this cinema
        const usersResult = await nodeDaoMongodb.updateMany(
            UserModel,
            { cinemaId: id },
            { isActive: false }
        );

        if (usersResult?.error) {
            // rollbac  Revert cinema soft delete
            await nodeDaoMongodb.findOneAndUpdate(
                CinemaModel,
                { _id: id },
                { isDeleted: false }
            );
            return next(new ApiError(`Error Deactivating Users: ${usersResult.error}`, 500));
        }

        res.status(200).json({
            message: "Cinema soft deleted and associated users deactivated",
            cinema: cinemaResult.data,
            usersAffected: usersResult.data.modifiedCount
        });
    } catch (error) {
        // rollback cinema soft delete in case of any unexpected errors
        try {
            await nodeDaoMongodb.findOneAndUpdate(
                CinemaModel,
                { _id: id },
                { isDeleted: false }
            );
        } catch (rollbackError) {
            console.error("Error during rollback:", rollbackError);
        }
        return next(new ApiError(`Error in Delete Cinema Operation: ${error.message}`, 500));
    }
});









// @desc    mark task is done
// @route   GET /api/v1/Cinema
// @access  Private
exports.viewCinema = expressAsyncHandler(async (req, res, next) => {
    let cinemaId;

    // check if id is passed in params
    if (req.params.id) {
        cinemaId = req.params.id;
    } 
    // if no id in params
    //check if user is authenticated and admin
    else if (req.user && req.user.role === 'admin') {
        cinemaId = req.user.cinemaId;
    } 

    // If neither condition is met return an error
    else {
        return next(new ApiError('Cinema ID is required or you must be an authenticated admin', 400));
    }

    try {
        const result = await nodeDaoMongodb.findOne(CinemaModel, { _id: cinemaId, isDeleted: false });

        if (!result || !result.data) {
            return next(new ApiError(`No cinema found with this ID`, 404));
        }

        if (result.error) {
            return next(new ApiError(`Error Fetching Cinema: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Cinema: ${error.message}`, 500));
    }
});




// @desc    mark task is done
// @route   GET /api/v1/Cinema/public
// @access  Public
exports.viewCinemasPublic = expressAsyncHandler(async (req, res, next) => {

    try {

        const result = await nodeDaoMongodb.select(CinemaModel);

        if (result?.error) {
            return next(new ApiError(`Error Fetching Cinemas: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Cinema: ${error.message}`, 500));
    }
});



// @desc    mark task is done
// @route   GET /api/v1/Cinema/:id
// @access  Public
exports.viewCinemaPublic = expressAsyncHandler(async (req, res, next) => {

    const id = req.params.id || req.user?.cinemaId
    try {

        const result = await nodeDaoMongodb.findOne(CinemaModel, { _id: id });


        if (!result) {
            return next(new ApiError(`no Cinema belong this id`, 404));
        }

        if (result?.error) {
            return next(new ApiError(`Error Fetching Cinema: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Cinema: ${error.message}`, 500));
    }
});
