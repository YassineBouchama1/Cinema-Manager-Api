const expressAsyncHandler = require('express-async-handler');
const MovieModel = require('../models/movieModel');
const ApiError = require('../utils/ApiError');
const dbOps = require('../utils/DatabaseOperations');


const sharp = require('sharp');

const dotenv = require('dotenv');
const { uploadSingleImage } = require('../middlewares/uploadimg');
const ShowTimeModel = require('../models/showTimeModel');
const ReservationModel = require('../models/reservationModel');
dotenv.config({ path: '.env' });









dotenv.config({ path: '.env' });



// @desc Resize Image That user input
exports.resizeImage = expressAsyncHandler(async (req, res, next) => {
    const fileName = `${req.user.cinemaId}-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;

    if (req.file) {
        await sharp(req.file.buffer)
            .toFile(`uploads/movies/${fileName}`);
        req.body.image = `/movies/${fileName}`;  // storage path
    }

    next();
});






//@Desc MiddleWare using multer to upload image to server
exports.imageUploaderMovie = uploadSingleImage('image');




// @desc    Create a new movie
// @route   POST /api/v1/movie
// @access  Private
exports.createMovie = expressAsyncHandler(async (req, res, next) => {
    const { cinemaId } = req.user;


    try {
        const result = await dbOps.insert(MovieModel, { ...req.body, cinemaId })



        if (result?.error) {
            return next(new ApiError(`Error Creating Movie: ${result.error}`, 500));
        }

        res.status(201).json({ data: result.data, message: result.message });
    } catch (error) {
        return next(new ApiError(`Error Creating Movie: ${error.message}`, 500));
    }
});





// @desc    Delete a movie
// @route   DELETE /api/v1/movie/:id
// @access  Private
exports.deleteMovie = expressAsyncHandler(async (req, res, next) => {
    try {


        const result = await dbOps.softDelete(MovieModel, { _id: req.resource.id });

        if (result?.error) {
            return next(new ApiError(`Error Deleting Movie: ${result.error}`, 500));
        }

        res.status(201).json(result);
    } catch (error) {
        return next(new ApiError(`Error Deleting Movie: ${error.message}`, 500));
    }
});

// @desc    Get all movies for a cinema
// @route   GET /api/v1/movie
// @access  Private
exports.viewMovies = expressAsyncHandler(async (req, res, next) => {
    const { cinemaId } = req.user;

    try {
        const result = await dbOps.select(MovieModel, { cinemaId });

        if (result?.error) {
            return next(new ApiError(`Error Fetching Movies: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Movies: ${error.message}`, 500));
    }
});

// @desc    Get a single movie by ID
// @route   GET /api/v1/movie/:id
// @access  Private
exports.viewMovie = expressAsyncHandler(async (req, res, next) => {
    try {
        res.status(200).json({ data: req.resource });
    } catch (error) {
        return next(new ApiError(`Error Fetching Movie: ${error.message}`, 500));
    }
});



// @desc    Update a movie
// @route   PUT /api/v1/movie/:id
// @access  Private
exports.updateMovie = expressAsyncHandler(async (req, res, next) => {
    try {

        const updateData = { ...req.body };


        // check if a new image file was uploaded | passed
        if (req.file) {
            updateData.image = req.body.image;
        }



        const movieUpdated = await dbOps.update(
            MovieModel,
            { _id: req.resource.id }, // resource comes from middlewar accessControle.ks
            updateData,
            { new: true }
        );

        if (movieUpdated?.error) {
            return next(new ApiError(`Error Updating Movie: ${movieUpdated.error}`, 500));
        }

        res.status(200).json(movieUpdated);
    } catch (error) {
        return next(new ApiError(`Error Updating Movie: ${error.message}`, 500));
    }
});




// @desc    Get all public movies
// @route   GET /api/v1/movie/public
// @access  Public
exports.viewMoviesPublic = expressAsyncHandler(async (req, res, next) => {
    const { search, genre, date, price, cinemaId } = req.query;

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
        showtimeConditions.movieId.category = genre;
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


    // Filter by cinemaId if provided
    if (cinemaId) {
        showtimeConditions.cinemaId = cinemaId; //only showtimes for specific cinema
    }

    try {


        // rtrieve showtimes based on the defined conditions
        const showtimeResults = await dbOps.select(ShowTimeModel, showtimeConditions);

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
        const result = await dbOps.select(MovieModel, conditions);

        if (result?.error) {
            return next(new ApiError(`Error Fetching Movies: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Movies: ${error.message}`, 500));
    }
});




// @desc    Get a single public movie by ID
// @route   GET /api/v1/movie/public/:id
// @access  Public
exports.viewMoviePublic = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    try {

        const result = await dbOps.findOne(MovieModel, { _id: id });

        if (!result || !result.data) {
            return next(new ApiError(`No movie found with this ID`, 404));
        }

        // define populate options for roomId
        const populateOptions = [
            { path: 'roomId', select: 'name capacity seatsPerRow' }
        ];

        // fetch showtimes for this movie
        const showtimes = await dbOps.select(ShowTimeModel, { movieId: id }, populateOptions);

        if (!showtimes) {
            return next(new ApiError(`No showtimes found for this movie`, 404));
        }

        // create an array to hold the showtimes with reserved seats [1j]
        const showtimesWithReservedSeats = await Promise.all(
            showtimes.data.map(async (showtime) => {


                // getch reservations for each showtime only  active reservations
                const reservations = await dbOps.select(ReservationModel, { showTimeId: showtime._id, status: 'active' });

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


