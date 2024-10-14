const expressAsyncHandler = require('express-async-handler');
const RatingService = require('../services/rating.service');
const ApiError = require('../../../utils/ApiError');

// @desc    Create a new rating
// @route   POST /api/v1/ratings
// @access  Private
exports.createRating = expressAsyncHandler(async (req, res, next) => {
    try {
        const ratingData = await RatingService.createRating({ ...req.body, userId: req.user._id });
        res.status(201).json({ data: ratingData, message: 'Rating created successfully' });
    } catch (error) {
        return next(new ApiError(`Error Creating Rating: ${error.message}`, 500));
    }
});

// @desc    Get all ratings for a movie
// @route   GET /api/v1/ratings/movie/:movieId
// @access  Public
exports.getRatingsByMovie = expressAsyncHandler(async (req, res, next) => {
    try {
        const ratings = await RatingService.getRatingsByMovie(req.params.movieId);
        res.status(200).json({ data: ratings });
    } catch (error) {
        return next(new ApiError(`Error fetching ratings: ${error.message}`, 500));
    }
});

// @desc    Delete a rating
// @route   DELETE /api/v1/ratings/:id
// @access  Private
exports.deleteRating = expressAsyncHandler(async (req, res, next) => {
    try {
        const result = await RatingService.deleteRating(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        return next(new ApiError(`Error deleting rating: ${error.message}`, 500));
    }
});