const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../../../utils/ApiError');
const MovieService = require('../services/movie.service');

// @desc    Upload media to storage 
// @route   
// @access  Private
exports.uploadMedia = expressAsyncHandler(async (req, res, next) => {
    try {
        const mediaData = await MovieService.uploadMedia(req);
        req.body.image = mediaData.image || req.body.image;
        req.body.video = mediaData.video || req.body.video;
        next();
    } catch (error) {
        return next(error);
    }
});

// @desc    Create a new movie
// @route   POST /api/v1/movie
// @access  Private
exports.createMovie = expressAsyncHandler(async (req, res, next) => {
    try {
        const movieData = await MovieService.createMovie(req.body);
        res.status(201).json({ data: movieData, message: 'Movie created successfully' });
    } catch (error) {
        return next(error);
    }
});

// @desc    Get a single movie by ID
// @route   GET /api/v1/movie/:id
// @access  Private - admin
exports.viewMovie = expressAsyncHandler(async (req, res, next) => {
    try {
        const movie = await MovieService.viewMovie(req.params.id);
        const hasStream = !!movie.video; // check if the movie has a video stream
        res.status(200).json({ ...movie.toObject(), hasStream });
    } catch (error) {
        return next(error);
    }
});

// @desc    Delete a movie
// @route   DELETE /api/v1/movie/:id
// @access  Private
exports.deleteMovie = expressAsyncHandler(async (req, res, next) => {
    try {
        const result = await MovieService.deleteMovie(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
});

// @desc    Update a movie
// @route   PUT /api/v1/movie/:id
// @access  Private
exports.updateMovie = expressAsyncHandler(async (req, res, next) => {
    try {
        const updateData = { ...req.body };
        if (req.files.image) {
            updateData.image = req.body.image;
        }
        if (req.files.video) {
            updateData.video = req.body.video;
        }
        const movieUpdated = await MovieService.updateMovie(req.params.id, updateData);
        res.status(200).json(movieUpdated);
    } catch (error) {
        return next(error);
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

    // Filter by category if provided
    if (genre) {
        conditions.genre = genre;
    }

    try {
        const movies = await MovieService.viewMovies(conditions);
        res.status(200).json({ data: movies });
    } catch (error) {
        return next(error);
    }
});