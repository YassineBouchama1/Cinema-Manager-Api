const expressAsyncHandler = require('express-async-handler');
const ShowTimeService = require('../services/showtime.service');
const ApiError = require('../../../utils/ApiError');
const Reservation = require('../../reservations/models/reservation.model');

// @desc    Create a new showtime
// @route   POST /api/v1/showtime
// @access  Private
exports.createShowTime = expressAsyncHandler(async (req, res, next) => {
    try {
        const showTimeData = await ShowTimeService.createShowTime(req.body);
        res.status(201).json({ data: showTimeData, message: 'Showtime created successfully' });
    } catch (error) {
        return next(new ApiError(`Error Creating ShowTime: ${error.message}`, 500));

    }
});

// @desc    Update a showtime
// @route   PUT /api/v1/showtime/:id
// @access  Private
exports.updateShowTime = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const updatedShowTime = await ShowTimeService.updateShowTime(id, req.body);
        res.status(200).json(updatedShowTime);
    } catch (error) {
        return next(new ApiError(`Error Update ShowTime: ${error.message}`, 500));

    }
});

// @desc    Delete a showtime
// @route   DELETE /api/v1/showtime/:id
// @access  Private
exports.deleteShowTime = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await ShowTimeService.deleteShowTime(id);
        res.status(200).json(result);
    } catch (error) {
        return next(new ApiError(`Error Delete ShowTime: ${error.message}`, 500));

    }
});

// @desc    Get all showtimes
// @route   GET /api/v1/showtime
// @access  Private - admin
exports.viewShowTimes = expressAsyncHandler(async (req, res, next) => {
    try {
        const showTimes = await ShowTimeService.viewShowTimes();
        res.status(200).json({ data: showTimes });
    } catch (error) {
        return next(new ApiError(`Error Fetch ShowTime: ${error.message}`, 500));

    }
});

// @desc    Get a single showtime by ID with reservations
// @route   GET /api/v1/showtime/:id
// @access  Private = super - admin
exports.viewShowTimeWithReservations = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const { showTime, reservations } = await ShowTimeService.viewShowTimeWithReservations(id);
        res.status(200).json({ showTime, reservations });
    } catch (error) {
        return next(new ApiError(`Error ShowTime ShowTime: ${error.message}`, 500));

    }
});

// @desc    Get all movies that have showtimes
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

    // Filter by category if provided
    if (genre) {
        showtimeConditions.movieId = showtimeConditions.movieId || {};
        showtimeConditions.movieId.genre = genre;
    }

    // Filter by date if provided
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
        // Retrieve showtimes based on the defined conditions
        const showtimeResults = await ShowTimeService.viewShowTimesPublic(showtimeConditions);

        // Extract unique movie IDs from the showtimes
        const movieIds = showtimeResults.map(showtime => showtime.movieId);
        const uniqueMovieIds = [...new Set(movieIds)]; // Remove duplicates

        // Find movies that match the unique movie IDs
        if (uniqueMovieIds.length > 0) {
            conditions._id = { $in: uniqueMovieIds }; // Filter movies based on showtime IDs
        } else {
            return res.status(200).json({ data: [] }); // No movies with showtimes
        }

        // Fetch movies based on the conditions
        const result = await ShowTimeService.viewShowTimesPublic(conditions);

        res.status(200).json({ data: result });
    } catch (error) {
        return next(new ApiError(`Error Fetching ShowTime: ${error.message}`, 500));

    }
});

// @desc    Get showtimes belonging to a movie
// @route   GET /api/v1/public/movie/:id
// @access  Public
exports.showTimesBelongMovie = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const showtimes = await ShowTimeService.showTimesBelongMovie(id);
        if (!showtimes) {
            return next(new ApiError(`No showtimes found for this movie`, 404));
        }

        // Create an array to hold the showtimes with reserved seats
        const showtimesWithReservedSeats = await Promise.all(
            showtimes.map(async (showtime) => {
                // Fetch reservations for each showtime only active reservations
                const reservations = await Reservation.find({ showTimeId: showtime._id, status: 'active' });
                const reservedSeats = reservations.flatMap(reservation => reservation.seats);

                // Return the showtime with reserved seats
                return {
                    ...showtime._doc, // Bring only data showtime
                    reservedSeats // Add seats reserved belong each showtime
                };
            })
        );

        res.status(200).json(showtimesWithReservedSeats);
    } catch (error) {
        return next(new ApiError(`Error Fetching ShowTime: ${error.message}`, 500));
    }
});