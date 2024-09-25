
const expressAsyncHandler = require('express-async-handler')
const CinemaModel = require('../models/cinemaModel');
const ApiError = require('../utils/ApiError');
const dbOps = require('../utils/DatabaseOperations');

const dotenv = require('dotenv');
const ShowTimeModel = require('../models/showTimeModel');
dotenv.config({ path: '.env' })











// @desc    mark task is done
// @route   POST /api/v1/Cinema
// @access  Private
exports.createCinema = expressAsyncHandler(async (req, res, next) => {
    try {

        const result = await dbOps.insert(CinemaModel, req.body);

        if (result?.error) {
            return next(new ApiError(`Error Creating Cinema: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data, message: result.message });
    } catch (error) {
        return next(new ApiError(`Error Creating Cinema: ${error.message}`, 500));
    }
});



// @desc    mark task is done
// @route   DELETE /api/v1/Cinema/:id
// @access  Private
exports.deleteCinema = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    try {
        // soft delete the cinema
        const cinemaResult = await dbOps.softDelete(
            CinemaModel,
            { _id: id },
        );

        if (cinemaResult?.error) {
            return next(new ApiError(`Error Soft Deleting Cinema: ${cinemaResult.error}`, 500));
        }

        if (!cinemaResult.data) {
            return next(new ApiError(`Cinema with id ${id} not found`, 404));
        }

        // deactivate all users associated with this cinema
        const usersResult = await dbOps.updateMany(
            UserModel,
            { cinemaId: id },
            { isActive: false }
        );


        if (usersResult?.error) {
            // rollbac  Revert cinema soft delete
            await dbOps.findOneAndUpdate(
                CinemaModel,
                { _id: id }
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
            await dbOps.findOneAndUpdate(
                CinemaModel,
                { _id: id }
            );
        } catch (rollbackError) {
            console.error("Error during rollback:", rollbackError);
        }
        return next(new ApiError(`Error in Delete Cinema Operation: ${error.message}`, 500));
    }
});





// @desc    mark task is done
// @route   DELETE /api/v1/Cinema:
// @access  Private
exports.hardDeleteCinema = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    try {
        // soft delete the cinema
        const cinemaResult = await dbOps.softDelete(
            CinemaModel,
            { _id: id },
        );

        if (cinemaResult?.error) {
            return next(new ApiError(`Error Soft Deleting Cinema: ${cinemaResult.error}`, 500));
        }

        if (!cinemaResult.data) {
            return next(new ApiError(`Cinema with id ${id} not found`, 404));
        }

        // deactivate all users associated with this cinema
        const usersResult = await dbOps.updateMany(
            UserModel,
            { cinemaId: id },
            { isActive: false }
        );


        if (usersResult?.error) {
            // rollbac  Revert cinema soft delete
            await dbOps.findOneAndUpdate(
                CinemaModel,
                { _id: id }
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
            await dbOps.findOneAndUpdate(
                CinemaModel,
                { _id: id }
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
        const result = await dbOps.findOne(CinemaModel, { _id: cinemaId });

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

        const result = await dbOps.select(CinemaModel);

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

    const id = req.params.id
    try {

        const result = await dbOps.findOne(CinemaModel, { _id: id });


        if (!result) {
            return next(new ApiError(`no Cinema belong this id`, 404));
        }

        if (result?.error) {
            return next(new ApiError(`Error Fetching Cinema: ${result.error}`, 500));
        }


        // bring showtime belong this cinema
        const showTimesResult = await dbOps.select(ShowTimeModel, { cinemaId: id })

        // check if data exst
        if (!showTimesResult?.data) {
            return next(new ApiError(`Error Fetching Cinema: ${result.error}`, 500));
        }

        const showTimes = showTimesResult.data

        res.status(201).json({ data: result.data, showTimes: showTimes });
    } catch (error) {
        return next(new ApiError(`Error Fetching Cinema: ${error.message}`, 500));
    }
});
