const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../../../utils/ApiError');
const RoomService = require('../services/room.service');

// @desc    Create a new room
// @route   POST /api/v1/room
// @access  Private
exports.createRoom = expressAsyncHandler(async (req, res, next) => {
    try {
        const roomData = await RoomService.createRoom(req.body);
        res.status(201).json({ data: roomData, message: 'Room created successfully' });
    } catch (error) {
        return next(error);
    }
});

// @desc    Delete a room
// @route   DELETE /api/v1/room/:id
// @access  Private
exports.deleteRoom = expressAsyncHandler(async (req, res, next) => {
    try {
        const result = await RoomService.deleteRoom(req.resource.id);
        res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
});

// @desc    View all rooms
// @route   GET /api/v1/room
// @access  Private : admins
exports.viewRooms = expressAsyncHandler(async (req, res, next) => {
    try {
        const rooms = await RoomService.viewRooms();
        res.status(200).json({ data: rooms });
    } catch (error) {
        return next(error);
    }
});

// @desc    View a single room
// @route   GET /api/v1/room/:id
// @access  Private
exports.viewRoom = expressAsyncHandler(async (req, res, next) => {
    try {
        const room = await RoomService.viewRoom(req.resource.id);
        res.status(200).json({ data: room });
    } catch (error) {
        return next(error);
    }
});

// @desc    Update a room
// @route   PUT /api/v1/room/:id
// @access  Private
exports.updateRoom = expressAsyncHandler(async (req, res, next) => {
    try {
        const roomUpdated = await RoomService.updateRoom(req.resource.id, req.body);
        res.status(200).json(roomUpdated);
    } catch (error) {
        return next(error);
    }
});

// @desc    View all rooms publicly
// @route   GET /api/v1/room
// @access  Public 
exports.viewRoomsPublic = expressAsyncHandler(async (req, res, next) => {
    try {
        const rooms = await RoomService.viewRoomsPublic();
        res.status(200).json({ data: rooms });
    } catch (error) {
        return next(error);
    }
});

// @desc    View a single room publicly
// @route   GET /api/v1/room/:id
// @access  Public
exports.viewRoomPublic = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    try {
        const room = await RoomService.viewRoomPublic(id);
        res.status(200).json({ data: room });
    } catch (error) {
        return next(error);
    }
});