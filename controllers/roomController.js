
const expressAsyncHandler = require('express-async-handler')
const RoomModel = require('../models/roomModel');
const ApiError = require('../utils/ApiError');
const dbOps = require('../utils/DatabaseOperations');
const dotenv = require('dotenv')
dotenv.config({ path: '.env' })












// @desc    mark task is done
// @route   POST /api/v1/room
// @access  Private
exports.createRoom = expressAsyncHandler(async (req, res, next) => {

    // get id cinema from uathed admin
    const { cinemaId } = req.user

    try {

        const result = await dbOps.insert(RoomModel, { ...req.body, cinemaId });

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


    try {


        //Notic : req.resource : is resource item passed from accessControl middlewar file

        const result = await dbOps.softDelete(RoomModel, { _id: req.resource.id });

        if (result?.error) {
            return next(new ApiError(`Error Deleting Room: ${result.error}`, 500));
        }

        res.status(201).json(result);
    } catch (error) {
        return next(new ApiError(`Error Deleting Room: ${error.message}`, 500));
    }
});



// @desc    mark task is done
// @route   GET /api/v1/room
// @access  Private : admins
exports.viewRooms = expressAsyncHandler(async (req, res, next) => {


    // get id cinema from uathed admin
    const { cinemaId = null } = req.user

    if (!cinemaId) {
        return next(new ApiError(`Cinema Id is required`, 400));

    }

    try {

        const result = await dbOps.select(RoomModel, { cinemaId });

        if (result?.error) {
            return next(new ApiError(`Error Fetching Rooms: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Room: ${error.message}`, 500));
    }
});





// @desc    mark task is done
// @route   GET /api/v1/room/:id
// @access  Private
exports.viewRoom = expressAsyncHandler(async (req, res, next) => {

    try {

        //Notic : req.resource : is resource item passed from accessControl middlewar file

        res.status(200).json({ data: req.resource });
    } catch (error) {
        return next(new ApiError(`Error Fetching Room: ${error.message}`, 500));
    }
});



// @desc    update room
// @route   GET /api/v1/room/:id
// @access  Private
exports.updateRoom = expressAsyncHandler(async (req, res, next) => {

    try {

        //Notic : req.resource : is resource item passed from accessControl middlewar file


        // update Room
        const roomUpdated = await dbOps.update(
            RoomModel,
            { _id: req.resource.id },
            req.body,
            { new: true }
        );

        // If there is an error updating the user
        if (roomUpdated?.error) {
            return next(new ApiError(`Error Creating Room: ${roomUpdated.error}`, 500));
        }

        res.status(200).json(roomUpdated);
    } catch (error) {
        return next(new ApiError(`Error Fetching Room: ${error.message}`, 500));
    }
});




// @desc    mark task is done
// @route   GET /api/v1/room
// @access  Public 
exports.viewRoomsPublic = expressAsyncHandler(async (req, res, next) => {



    try {

        const result = await dbOps.select(RoomModel, { _id: id });

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

        const result = await dbOps.findOne(RoomModel, { _id: id });


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