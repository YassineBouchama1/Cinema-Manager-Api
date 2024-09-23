const expressAsyncHandler = require('express-async-handler');
const ShowTimeModel = require('../models/showTimeModel');
const MovieModel = require('../models/movieModel');
const ApiError = require('../utils/ApiError');
const NodeDaoMongodb = require('../service/node-dao-mongodb');

const nodeDaoMongodb = NodeDaoMongodb.getInstance();

// @desc    create a new showtime
// @route   POST /api/v1/showtime
// @access  private
exports.createShowTime = expressAsyncHandler(async (req, res, next) => {
    const { price, movieId, roomId, startAt } = req.body;
    const { cinemaId } = req.user;

    // Get the movie's duration
    const movie = await MovieModel.findById(movieId);
    if (!movie) {
        return next(new ApiError('Movie not found', 404));
    }

    const durationInMillis = movie.duration * 60 * 1000; // Convert to milliseconds
    const additionalTime = 10 * 60 * 1000; // 10 minutes in milliseconds

    const endAt = new Date(new Date(startAt).getTime() + durationInMillis + additionalTime);

    try {
        const result = await nodeDaoMongodb.insert(ShowTimeModel, {
            price,
            movieId,
            roomId,
            startAt: new Date(startAt),
            endAt,
            cinemaId
        });

        if (result?.error) {
            return next(new ApiError(`Error Creating Showtime: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data, message: result.message });
    } catch (error) {
        return next(new ApiError(`Error Creating Showtime: ${error.message}`, 500));
    }
});



// @desc    Update a showtime
// @route   PUT /api/v1/showtime/:id
// @access  Private
exports.updateShowTime = expressAsyncHandler(async (req, res, next) => {
    const { startAt, price, roomId } = req.body;



    //req,resource is showtime item / watch accessControl file

    let showTime = req.resource

    // Get the movie duration
    const movie = await MovieModel.findById(showTime.movieId);

    if (!movie) {
        return next(new ApiError('Movie not found', 404));
    }

    const durationInMillis = movie.duration * 60 * 1000; // convert to milliseconds
    const additionalTime = 10 * 60 * 1000; // 10 minutes 

    // Update fields
    showTime.startAt = startAt ? new Date(startAt) : showTime.startAt;
    showTime.endAt = new Date(showTime.startAt.getTime() + durationInMillis + additionalTime);
    showTime.price = price || showTime.price;
    showTime.roomId = roomId || showTime.roomId;

    // save the updated showtime
    const updatedShowTime = await showTime.save();

    res.status(200).json(updatedShowTime);
});




// @desc    delete a showtime
// @route   DELETE /api/v1/showtime/:id
// @access  Private
exports.deleteShowTime = expressAsyncHandler(async (req, res, next) => {
    try {

        //req,resource is showtime item / watch accessControl file

        let showTime = req.resource

        const result = await nodeDaoMongodb.deleteOne(ShowTimeModel, { _id: showTime.id });

        if (result?.error) {
            return next(new ApiError(`Error Deleting Showtime: ${result.error}`, 500));
        }

        res.status(200).json(result);
    } catch (error) {
        return next(new ApiError(`Error Deleting Showtime: ${error.message}`, 500));
    }
});


// @desc    get all showtimes for a cinema
// @route   GET /api/v1/showtime
// @access  Private
exports.viewShowTimes = expressAsyncHandler(async (req, res, next) => {
    const { cinemaId } = req.user;

    try {
        const result = await nodeDaoMongodb.select(ShowTimeModel, { cinemaId });

        if (result?.error) {
            return next(new ApiError(`Error Fetching Showtimes: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Showtimes: ${error.message}`, 500));
    }
});



// @desc    Get a single showtime by ID
// @route   GET /api/v1/showtime/:id
// @access  Public
exports.viewShowTime = expressAsyncHandler(async (req, res, next) => {
    try {
        const showTime = await ShowTimeModel.findById(req.params.id);
        if (!showTime) {
            return next(new ApiError('Showtime not found', 404));
        }

        res.status(200).json({ data: showTime });
    } catch (error) {
        return next(new ApiError(`Error Fetching Showtime: ${error.message}`, 500));
    }
});
