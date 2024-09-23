
const expressAsyncHandler = require('express-async-handler')
const RoomModel = require('../models/roomModel');
const ApiError = require('../utils/ApiError');
const NodeDaoMongodb = require('../service/node-dao-mongodb');

const dotenv = require('dotenv')
dotenv.config({ path: '.env' })


// get instance from service object
const nodeDaoMongodb = NodeDaoMongodb.getInstance();







// @desc    mark task is done
// @route   POST /api/v1/room
// @access  Private
exports.createRoom = expressAsyncHandler(async (req, res, next) => {

    // get id cinema from uathed admin
    const { cinemaId } = req.user

    try {

        const result = await nodeDaoMongodb.insert(RoomModel, { ...req.body, cinemaId });

        if (result?.error) {
            return next(new ApiError(`Error Creating Room: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data, message: result.message });
    } catch (error) {
        return next(new ApiError(`Error Creating Room: ${error.message}`, 500));
    }
});



// @desc    mark task is done
// @route   DELETE /api/v1/room
// @access  Private
exports.deleteRoom = expressAsyncHandler(async (req, res, next) => {

    const { id } = req.params
    try {

        const result = await nodeDaoMongodb.deleteOne(RoomModel, { _id: id });

        if (result?.error) {
            return next(new ApiError(`Error Deleting Room: ${result.error}`, 500));
        }

        res.status(201).json({ message: result.message });
    } catch (error) {
        return next(new ApiError(`Error Deleting Room: ${error.message}`, 500));
    }
});



// @desc    mark task is done
// @route   GET /api/v1/room
// @access  Private : admins
exports.viewRooms = expressAsyncHandler(async (req, res, next) => {


    // get id cinema from uathed admin
    const { cinemaId } = req.user
    try {

        const result = await nodeDaoMongodb.select(RoomModel, { cinemaId });

        if (result?.error) {
            return next(new ApiError(`Error Fetching Rooms: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Room: ${error.message}`, 500));
    }
});





// @desc    mark task is done
// @route   GET /api/v1/room/:id
// @access  Private
exports.viewRoom = expressAsyncHandler(async (req, res, next) => {

    const { id } = req.params
    try {

        const result = await nodeDaoMongodb.findOne(RoomModel, { _id: id, isDeleted: false });


        if (!result) {
            return next(new ApiError(`no room belong this id`, 404));
        }

        if (result?.error) {
            return next(new ApiError(`Error Fetching Room: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Room: ${error.message}`, 500));
    }
});





// @desc    mark task is done
// @route   GET /api/v1/room
// @access  Public 
exports.viewRoomsPublic = expressAsyncHandler(async (req, res, next) => {


    try {

        const result = await nodeDaoMongodb.select(RoomModel, { _id: id, isDeleted: false });

        if (result?.error) {
            return next(new ApiError(`Error Fetching Rooms: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Room: ${error.message}`, 500));
    }
});




// @desc    mark task is done
// @route   GET /api/v1/room/:id
// @access  Public
exports.viewRoomPublic = expressAsyncHandler(async (req, res, next) => {

    const { id } = req.params
    try {

        const result = await nodeDaoMongodb.findOne(RoomModel, { _id: id, isDeleted: false });


        if (!result) {
            return next(new ApiError(`no room belong this id`, 404));
        }

        if (result?.error) {
            return next(new ApiError(`Error Fetching Room: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Room: ${error.message}`, 500));
    }
});