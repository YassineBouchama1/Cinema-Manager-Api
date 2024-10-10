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


    try {
        const result = await dbOps.insert(MovieModel, req.body)



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



// @desc    Get a single movie by ID
// @route   GET /api/v1/movie/:id
// @access  Private
exports.viewMovieAdmin = expressAsyncHandler(async (req, res, next) => {
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











// @desc    Get all public movies streaming
// @route   GET /api/v1/movie
// @access  Public 
exports.viewMovies = expressAsyncHandler(async (req, res, next) => {
    const { search, genre, date, price } = req.query;

    const conditions = {};

    // Filter by movie name if provided
    if (search) {
        conditions.name = { $regex: search, $options: 'i' };
    }

   
    // filter by category if provided
    if (genre) {
       conditions.genre = genre;
    }


    try {


        const result = await dbOps.select(MovieModel,conditions);

        if (result?.error) {
            return next(new ApiError(`Error Fetching Movies: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Movies: ${error.message}`, 500));
    }
});
