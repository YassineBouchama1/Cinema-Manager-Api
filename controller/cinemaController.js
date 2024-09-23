
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

    const { id } = req.params
    try {

        const result = await nodeDaoMongodb.deleteOne(CinemaModel, { _id: id });

        if (result?.error) {
            return next(new ApiError(`Error Deleting Cinema: ${result.error}`, 500));
        }

        res.status(201).json({ message: result.message });
    } catch (error) {
        return next(new ApiError(`Error Deleting Cinema: ${error.message}`, 500));
    }
});



// @desc    mark task is done
// @route   GET /api/v1/Cinema
// @access  Private
exports.viewCinemas = expressAsyncHandler(async (req, res, next) => {

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
// @access  Private
exports.viewCinema = expressAsyncHandler(async (req, res, next) => {

    const { id } = req.params
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