const expressAsyncHandler = require('express-async-handler');
const ShowTimeModel = require('../models/showTimeModel');
const MovieModel = require('../models/movieModel');
const ApiError = require('../utils/ApiError');
const DatabaseOperations = require('../utils/DatabaseOperations');
const RoomModel = require('../models/roomModel');
const ReservationModel = require('../models/reservationModel');

const dbOps = DatabaseOperations.getInstance();


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



    //TODO: add validaton to check if room is avaible in this time

    //req.resource is showtime item / watch accessControl file
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



// @desc    get all showtimes for a cinema for public
// @route   GET /api/v1/public/showTimes
// @access  Public
exports.viewShowTimesPublic = expressAsyncHandler(async (req, res, next) => {

    const { cat = null, date, price, cinemaId } = req.query;

    // bring date now use it to bring only showtime that not passed date now
    const now = new Date();

    // add 10 min : even showtime start 
    const tenMinutesLater = new Date(now.getTime() - 10 * 60 * 1000);

    // define base conditionz
    const conditions = {
        startAt: { $gte: tenMinutesLater } // great than equal time now + 10min

    };


    // filter by category if provided
    if (cat) {
        conditions.movieId = conditions.movieId || {};
        conditions.movieId.category = cat;
    }



    // filter by date if provided
    if (date) {
        const selectedDate = new Date(date);

        // setup start date and add hour start from first hour
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0)); //start hours day

        // set hour before midnight
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999)); // end hour day


        conditions.startAt.$gte = startOfDay;

        // Only showtimes within the selected date
        conditions.startAt.$lte = endOfDay;
    }



    // filter by price if provided
    if (price) {
        conditions.price = { $lte: price };
    }

    // filter by cinemaId if provided
    if (cinemaId) {
        conditions.cinemaId = cinemaId; // Only  showtimes for spicif cinema
    }

    // define populate options for movieId and roomId
    const populateOptions = [
        { path: 'movieId', select: 'name duration category image' },
        { path: 'roomId', select: 'name capacity' }
    ];


    try {
        const result = await dbOps.select(ShowTimeModel, conditions, populateOptions);

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