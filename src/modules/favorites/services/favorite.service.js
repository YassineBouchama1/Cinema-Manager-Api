const Favorite = require('../models/favorite.model');
const ApiError = require('../../../utils/ApiError');

class FavoriteService {
    async addFavorite(favoriteData) {
        const newFavorite = new Favorite(favoriteData);
        try {
            const savedFavorite = await newFavorite.save();
            return savedFavorite;
        } catch (error) {
            throw new ApiError(`Error Adding Favorite: ${error.message}`, 500);
        }
    }
    async getFavoritesByUser(userId) {
        const favorites = await Favorite.find({ userId, isDeleted: false })
            .populate('movieId', 'title image')
            .sort({ createdAt: -1 });

        // format the favorites 
        const formattedFavorites = favorites.map(favorite => ({
            id: favorite._id,
            movieId: favorite.movieId._id,
            title: favorite.movieId.title,
            image: favorite.movieId.image,
            createdAt: favorite.createdAt,
        }));

        return formattedFavorites;
    }

    async removeFavorite(id, userId) {
        const favorite = await Favorite.findById(id);

        if (!favorite) {
            throw new ApiError(`Error Removing Favorite: Favorite not found`, 404);
        }

        if (userId !== favorite.userId.toString()) {
            throw new ApiError(`Error Removing Favorite: You do not have permission to remove this favorite`, 403);
        }

        const result = await Favorite.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

        return result;
    }
}

module.exports = new FavoriteService();