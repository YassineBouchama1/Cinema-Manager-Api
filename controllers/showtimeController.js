const expressAsyncHandler = require('express-async-handler');
const ShowTimeModel = require('../models/showTimeModel');
const MovieModel = require('../models/movieModel');
const ApiError = require('../utils/ApiError');
const dbOps = require('../utils/DatabaseOperations');
const RoomModel = require('../models/roomModel');
const ReservationModel = require('../models/reservationModel');




// @desc    create a new showtime
// @route   POST /api/v1/showtime
// @access  private
//@TODO : add validation if room avaible in that time
exports.createShowTime = expressAsyncHandler(async (req, res, next) => {
    const { price, movieId, roomId, startAt } = req.body;
    const { cinemaId } = req.user;


    // get movie
    const movieResult = await dbOps.findOne(MovieModel, { _id: movieId });


    if (!movieResult || !movieResult.data) {
        return next(new ApiError('Movie not found', 404));
    }

    const movie = movieResult.data;

    // ceck if this movie belong to the same cinema
    if (movie.cinemaId.toString() !== cinemaId.toString()) {
        return next(new ApiError("The movie doesnt belong to your cinema", 403));
    }

    // fet room
    const roomResult = await dbOps.findOne(RoomModel, { _id: roomId });
    if (!roomResult || !roomResult.data) {
        return next(new ApiError('Room not found', 404));
    }

    const room = roomResult.data;


    // check if this room belong to the same cinema
    if (room.cinemaId.toString() !== cinemaId.toString()) {
        return next(new ApiError("The room doesn't belong to your cinema", 403));
    }

    //@TODO : add validation if room avaible in that time


    // validate and parse startAt
    const parsedStartAt = new Date(startAt); // convert to date form

    if (isNaN(parsedStartAt.getTime())) {
        return next(new ApiError('Invalid startAt date format', 400));
    }


    const durationInMinutes = Number(movie.duration);
    if (isNaN(durationInMinutes)) {
        return next(new ApiError('Invalid movie duration', 400));
    }


    // calcul endAt based on movie durat + additional time : 10min
    const durationInMillis = durationInMinutes * 60 * 1000; // convert to milliseconds
    const additionalTime = 10 * 60 * 1000; // 10 minutes in milliseconds
    const endAt = new Date(parsedStartAt.getTime() + durationInMillis + additionalTime);




    try {
        const result = await dbOps.insert(ShowTimeModel, {
            price,
            movieId,
            roomId,
            startAt: parsedStartAt,
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

    // TODO: add validation to check if the room is available at this time

    // req.resource is showtime item / watch accessControl file
    let showTime = req.resource;

    try {
        // det the movie duration
        const movie = await MovieModel.findById(showTime.movieId);
        if (!movie) {
            return next(new ApiError('Movie not found', 404));
        }

        const durationInMillis = movie.duration * 60 * 1000; // convert to ms
        const additionalTime = 10 * 60 * 1000; // 10 min 

        // prepare updated fields
        const updatedFields = {
            startAt: startAt ? new Date(startAt) : showTime.startAt,
            endAt: new Date((startAt ? new Date(startAt) : showTime.startAt).getTime() + durationInMillis + additionalTime),
            price: price || showTime.price,
            roomId: roomId || showTime.roomId,
        };

        // update the showtime using the update function
        const result = await dbOps.update(ShowTimeModel, { _id: showTime.id }, updatedFields);

        if (result?.error) {
            return next(new ApiError(`Error Updating Showtime: ${result.error}`, 500));
        }

        res.status(200).json(result);
    } catch (error) {
        return next(new ApiError(`Error Updating Showtime: ${error.message}`, 500));
    }
});




// @desc    delete a showtime
// @route   DELETE /api/v1/showtime/:id
// @access  Private
exports.deleteShowTime = expressAsyncHandler(async (req, res, next) => {
    try {

        //req.resource is showtime item / watch accessControl file
        let showTime = req.resource

        const result = await dbOps.softDelete(ShowTimeModel, { _id: showTime.id });

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
        const result = await dbOps.select(ShowTimeModel, { cinemaId });

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

    const { id } = req.params
    try {
        const showTime = await dbOps.findOne(ShowTimeModel, { _id: id })
            .populate([
                { path: 'movieId', select: 'name duration category' },
                { path: 'roomId', select: 'name capacity' }
            ]);

        if (!showTime) {
            return next(new ApiError('Showtime not found', 404));
        }




        res.status(200).json({ data: showTime });
    } catch (error) {
        return next(new ApiError(`Error Fetching Showtime: ${error.message}`, 500));
    }
});





// @desc    Get a single showtime by ID with reservations
// @route   GET /api/v1/showtime/:id
// @access  Private = super - admin
exports.viewShowTimeWithReservations = expressAsyncHandler(async (req, res, next) => {

    const { id } = req.params


    try {
        const showTimeResult = await dbOps.findOne(ShowTimeModel, { _id: id })
            .populate([
                { path: 'movieId', select: 'name duration category' },
                { path: 'roomId', select: 'name capacity' }
            ]);

        if (!showTimeResult.data) {
            return next(new ApiError('Showtime not found', 404));
        }

        let showTime = showTimeResult.data


        const reservationsResult = await dbOps.select(ReservationModel, { showTimeId: showTime._id });


        if (!reservationsResult.data) {
            return next(new ApiError('reservations not found', 404));
        }


        let reservations = reservationsResult

        res.status(200).json({ showTime: showTime, reservations: reservations.data });


    } catch (error) {
        return next(new ApiError(`Error Fetching Showtime: ${error.message}`, 500));
    }
});