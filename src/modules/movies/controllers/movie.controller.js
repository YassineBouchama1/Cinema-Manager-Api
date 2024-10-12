const expressAsyncHandler = require('express-async-handler');
const MovieModel = require('../models/movieModel');
const ApiError = require('../utils/ApiError');
const dbOps = require('../utils/DatabaseOperations');


const sharp = require('sharp');

const dotenv = require('dotenv');

const minioClient = require('../config/minioClient.config');
const { generateVideoPresignedUrl } = require('../utils/minioUtils');
dotenv.config({ path: '../env' });











// @desc    Upload media to storage 
// @route   
// @access  Private
exports.uploadMedia = expressAsyncHandler(async (req, res, next) => {
    const timestamp = Date.now();
    const randomId = Math.round(Math.random() * 1E9);

    // handle image upload
    if (req.files.image) {
        const imageFile = req.files.image[0];
        const imageFileName = `movies/images/${req.body.name}-${timestamp}-${randomId}.png`;

        // resize and upload image
        const imageBuffer = await sharp(imageFile.buffer).toBuffer();
        await minioClient.putObject('cinema', imageFileName, imageBuffer);
        req.body.image = `/cinema/${imageFileName}`;
    }

    // handle video upload if provided
    if (req.files.video) {
        const videoFile = req.files.video[0];
        const videoFileName = `movies/videos/${req.body.name}-${timestamp}-${randomId}.mp4`;

        // upload video
        await minioClient.putObject('cinema', videoFileName, videoFile.buffer);
        req.body.video = `/cinema/${videoFileName}`;
    }

    next();
});




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





// @desc    Get a single movie by ID
// @route   GET /api/v1/movie/:id
// @access  Private - admin
exports.viewMovie = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const movieResult = await dbOps.findOne(MovieModel, { _id: id });

    if (movieResult?.error) {
        return next(new ApiError(`Resource not found: ${movieResult.error}`, 500));
    }

    if (!movieResult.data) {
        return next(new ApiError(`No resource found with this ID`, 404));
    }

    const movie = movieResult.data; // Fill movie with data from db



    let hasStream = false

    if (movie.video) {

        hasStream = true
    }


    res.status(200).json({
        data: {
            ...movie.toObject(),
            hasStream,

        },
    });
});


// @desc    Get a single movie by ID but if user not authed or subscribe cant watch movie
// @route   GET /api/v1/public/movie/:id
// @access  public 
exports.getOneMoviePublic = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const movieResult = await dbOps.findOne(MovieModel, { _id: id });

    if (movieResult?.error) {
        return next(new ApiError(`Resource not found: ${movieResult.error}`, 500));
    }

    if (!movieResult.data) {
        return next(new ApiError(`No resource found with this ID`, 404));
    }

    const movie = movieResult.data;


    // Determine if the movie has a video stream
    let hasStream = false;
    if (movie.video) {
        hasStream = true;
    }


    res.status(200).json({
        data: {
            id: movie._id,
            name: movie.name,
            duration: movie.duration,
            image: movie.image,
            genre: movie.genre,
            rate: movie.rate,

            hasStream,

        },
    });
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



// // @desc    Get a single movie by ID
// // @route   GET /api/v1/movie/:id
// // @access  Private
// exports.viewMovieAdmin = expressAsyncHandler(async (req, res, next) => {
//     try {
//         res.status(200).json({ data: req.resource });
//     } catch (error) {
//         return next(new ApiError(`Error Fetching Movie: ${error.message}`, 500));
//     }
// });



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
    const { search, genre } = req.query;

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

        const fields = 'name genre image rate';
        const result = await dbOps.select(MovieModel, conditions, null, fields);

        if (result?.error) {
            return next(new ApiError(`Error Fetching Movies: ${result.error}`, 500));
        }

        res.status(200).json({ data: result.data });
    } catch (error) {
        return next(new ApiError(`Error Fetching Movies: ${error.message}`, 500));
    }
});





