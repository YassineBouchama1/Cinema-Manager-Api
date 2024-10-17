const expressAsyncHandler = require('express-async-handler');
const FavoriteService = require('../services/favorite.service');
const ApiError = require('../../../utils/ApiError');

// @desc    Add a movie to favorites
// @route   POST /api/v1/favorites
// @access  Private
exports.addFavorite = expressAsyncHandler(async (req, res, next) => {
    try {
        const favoriteData = await FavoriteService.addFavorite({ ...req.body, userId: req.user.id });
        res.status(201).json({ data: favoriteData, message: 'Favorite added successfully' });
    } catch (error) {
        return next(new ApiError(`Error Adding Favorite: ${error.message}`, 500));
    }
});

// @desc    Get all favorite movies for a user
// @route   GET /api/v1/favorites/user/:userId
// @access  Private
exports.getFavoritesByUser = expressAsyncHandler(async (req, res, next) => {
    try {
        const favorites = await FavoriteService.getFavoritesByUser(req.params.userId);
        res.status(200).json({ data: favorites });
    } catch (error) {
        return next(new ApiError(`Error fetching favorites: ${error.message}`, 500));
    }
});

// @desc    Remove a movie from favorites
// @route   DELETE /api/v1/favorites/:id
// @access  Private
exports.removeFavorite = expressAsyncHandler(async (req, res, next) => {
    try {
        const result = await FavoriteService.removeFavorite(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        return next(new ApiError(`Error removing favorite: ${error.message}`, 500));
    }
});