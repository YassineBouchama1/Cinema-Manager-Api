const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../../../utils/ApiError');
const dbOps = require('../../../utils/DatabaseOperations');
const Movie = require('../../movies/models/movie.model');
const Room = require('../../rooms/models/room.model');
const ShowTime = require('../models/showtime.model');
const Reservation = require('../../reservations/models/reservation.model');




// @desc    create a new showtime
// @route   POST /api/v1/showtime
// @access  private
//@TODO : add validation if room avaible in that time
exports.createShowTime = expressAsyncHandler(async (req, res, next) => {
    const { price, movieId, roomId, startAt } = req.body;


    // get movie
    const movieResult = await dbOps.findOne(Movie, { _id: movieId });


    if (!movieResult || !movieResult.data) {
        return next(new ApiError('Movie not found', 404));
    }

    const movie = movieResult.data;


    // fet room
    const roomResult = await dbOps.findOne(Room, { _id: roomId });
    if (!roomResult || !roomResult.data) {
        return next(new ApiError('Room not found', 404));
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
        const result = await dbOps.insert(ShowTime, {
            price,
            movieId,
            roomId,
            startAt: parsedStartAt,
            endAt

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
        const movie = await Movie.findById(showTime.movieId);
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
        const result = await dbOps.update(ShowTime, { _id: showTime.id }, updatedFields);

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

        const result = await dbOps.softDelete(ShowTime, { _id: showTime.id });

        if (result?.error) {
            return next(new ApiError(`Error Deleting Showtime: ${result.error}`, 500));
        }

        res.status(200).json(result);
    } catch (error) {
        return next(new ApiError(`Error Deleting Showtime: ${error.message}`, 500));
    }
});


// @desc    get all showtimes 
// @route   GET /api/v1/showtime
// @access  Private - admin
exports.viewShowTimes = expressAsyncHandler(async (req, res, next) => {

    try {
        const result = await dbOps.select(ShowTime);

        if (result?.error) {
            return next(new ApiError(`Error Fetching Showtimes: ${result.error}`, 500));
        }


        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Showtimes: ${error.message}`, 500));
    }
});










// @desc    Get a single showtime by ID with reservations
// @route   GET /api/v1/showtime/:id
// @access  Private = super - admin
exports.viewShowTimeWithReservations = expressAsyncHandler(async (req, res, next) => {

    const { id } = req.params


    try {
        const showTimeResult = await dbOps.findOne(ShowTime, { _id: id })
            .populate([
                { path: 'movieId', select: 'name duration category' },
                { path: 'roomId', select: 'name capacity' }
            ]);

        if (!showTimeResult.data) {
            return next(new ApiError('Showtime not found', 404));
        }

        let showTime = showTimeResult.data


        const reservationsResult = await dbOps.select(Reservation, { showTimeId: showTime._id });


        if (!reservationsResult.data) {
            return next(new ApiError('reservations not found', 404));
        }


        let reservations = reservationsResult

        res.status(200).json({ showTime: showTime, reservations: reservations.data });


    } catch (error) {
        return next(new ApiError(`Error Fetching Showtime: ${error.message}`, 500));
    }
});




// @desc    Get all  movies that has showtimes  
// @route   GET /api/v1/public/showTimes
// @access  Public
exports.viewShowTimesPublic = expressAsyncHandler(async (req, res, next) => {
    const { search, genre, date, price } = req.query;

    const conditions = {};

    // Filter by movie name if provided
    if (search) {
        conditions.name = { $regex: search, $options: 'i' };
    }

    // Find all showtimes based on additional filters
    const showtimeConditions = {};

    // Get current date and time
    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes later
    showtimeConditions.startAt = { $gte: tenMinutesLater }; // only future showtimes

    // filter by category if provided
    if (genre) {
        showtimeConditions.movieId = showtimeConditions.movieId || {};
        showtimeConditions.movieId.genre = genre;
    }

    // filter by date if provided
    if (date) {
        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

        showtimeConditions.startAt.$gte = startOfDay;
        showtimeConditions.startAt.$lte = endOfDay;
    }


    // Filter by price if provided
    if (price) {
        showtimeConditions.price = { $lte: price };
    }




    try {


        // rtrieve showtimes based on the defined conditions
        const showtimeResults = await dbOps.select(ShowTime, showtimeConditions);

        if (showtimeResults?.error) {
            return next(new ApiError(`Error Fetching Showtimes: ${showtimeResults.error}`, 500));
        }

        // extract unique movie IDs from the showtimes
        const movieIds = showtimeResults.data.map(showtime => showtime.movieId);
        const uniqueMovieIds = [...new Set(movieIds)]; // Remove duplicates

        // find movies that match the unique movie IDs
        if (uniqueMovieIds.length > 0) {
            conditions._id = { $in: uniqueMovieIds }; // Filter movies based on showtime IDs
        } else {
            return res.status(200).json({ data: [] }); // No movies with showtimes
        }

        // Fetch movies based on the conditions
        const result = await dbOps.select(Movie, conditions);

        if (result?.error) {
            return next(new ApiError(`Error Fetching Movies: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Movies: ${error.message}`, 500));
    }
});



// @desc    get showtimes belong movie
// @route   GET /api/v1/public/movie/:id
// @access  Public
exports.showTimesBelongMovie = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    try {

        const result = await dbOps.findOne(Movie, { _id: id });

        if (!result || !result.data) {
            return next(new ApiError(`No movie found with this ID`, 404));
        }

        // define populate options for roomId
        const populateOptions = [
            { path: 'roomId', select: 'name capacity seatsPerRow' }
        ];

        // fetch showtimes for this movie
        const showtimes = await dbOps.select(ShowTime, { movieId: id }, populateOptions);

        if (!showtimes) {
            return next(new ApiError(`No showtimes found for this movie`, 404));
        }

        // create an array to hold the showtimes with reserved seats [1j]
        const showtimesWithReservedSeats = await Promise.all(
            showtimes.data.map(async (showtime) => {


                // getch reservations for each showtime only  active reservations
                const reservations = await dbOps.select(Reservation, { showTimeId: showtime._id, status: 'active' });

                // collec all reserved seats for the current showtime
                const reservedSeats = reservations.data.flatMap(reservation => reservation.seats);


                // return the showtime with reserved seats
                return {
                    ...showtime._doc, // bring only data showtime
                    reservedSeats // add setas reserved belong eahc showtime
                };
            })
        );

        res.status(200).json({ data: result.data, showTimes: showtimesWithReservedSeats });
    } catch (error) {
        return next(new ApiError(`Error Fetching Movie: ${error.message}`, 500));
    }
});
