const Rating = require('../models/rating.model');
const ApiError = require('../../../utils/ApiError');
const Movie = require('../../movies/models/movie.model');


class RatingService {
    async createRating(ratingData) {
        const { userId, movieId, value } = ratingData;

        try {
            // check if the user has already ratingd this movie
            const existingRating = await Rating.findOne({ userId, movieId, isDeleted: false });

            if (existingRating) {


                // If the rating exists update it

                existingRating.value = value; // update the rating value
                await existingRating.save();
            } else {
                // if no exist create new one
                const newRating = new Rating(ratingData);
                await newRating.save();
            }

            // update the movie rating after creating or updating
            await this.updateMovieRating(movieId);
        } catch (error) {
            throw new ApiError(`Error Creating or Updating Rating: ${error.message}`, 500);
        }
    }

    async updateMovieRating(movieId) {


        const ratings = await Rating.find({ movieId, isDeleted: false });

        if (ratings.length === 0) {


            // if there are no rating set the movie rating to 0
            await Movie.findByIdAndUpdate(movieId, { rating: 0 });
            return;
        }

        // calculate the new average rating
        const totalRating = ratings.reduce((acc, rating) => acc + rating.value, 0);
        const averageRating = totalRating / ratings.length;

        // here will ensure the average rating does not exceed 5
        const cappedAverageRating = Math.min(averageRating, 5);

        await Movie.findByIdAndUpdate(movieId, { rating: cappedAverageRating });
    }

    async getRatingsByMovie(movieId) {
        const ratings = await Rating.find({ movieId, isDeleted: false });
        return ratings;
    }

    async deleteRating(id) {
        const result = await Rating.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!result) {
            throw new ApiError(`Error Deleting Rating: Rating not found`, 404);
        }
        return result;
    }



    async getUserRating(userId, movieId) {
        const rating = await Rating.findOne({ userId, movieId, isDeleted: false });
        return rating; // this will return null if user dosnt rat this movie
    }
}

module.exports = new RatingService();