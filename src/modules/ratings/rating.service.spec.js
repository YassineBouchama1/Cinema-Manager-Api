const RatingService = require('./rating.service');
const Rating = require('./rating.model');
// const ApiError = require('../../utils/ApiError');
const Movie = require('../movies/movie.model');

// Mocking external dependencies
jest.mock('./rating.model');
jest.mock('../../utils/ApiError');
jest.mock('../movies/movie.model');

describe('RatingService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });



    describe('updateMovieRating', () => {
        it('should set movie rating to 0 if no ratings exist', async () => {
            const movieId = 'movieId123';
            Rating.find.mockResolvedValue([]);
            Movie.findByIdAndUpdate.mockResolvedValue({});

            await RatingService.updateMovieRating(movieId);

            expect(Movie.findByIdAndUpdate).toHaveBeenCalledWith(movieId, { rating: 0 });
        });

        it('should update the movie rating based on existing ratings', async () => {
            const movieId = 'movieId123';
            const ratings = [{ value: 4 }, { value: 5 }];
            Rating.find.mockResolvedValue(ratings);
            Movie.findByIdAndUpdate.mockResolvedValue({});

            await RatingService.updateMovieRating(movieId);

            expect(Movie.findByIdAndUpdate).toHaveBeenCalledWith(movieId, { rating: 4.5 });
        });

        it('should cap the average rating at 5', async () => {
            const movieId = 'movieId123';
            const ratings = [{ value: 5 }, { value: 5 }];
            Rating.find.mockResolvedValue(ratings);
            Movie.findByIdAndUpdate.mockResolvedValue({});

            await RatingService.updateMovieRating(movieId);

            expect(Movie.findByIdAndUpdate).toHaveBeenCalledWith(movieId, { rating: 5 });
        });
    });

    describe('getRatingsByMovie', () => {
        it('should return ratings for a given movie', async () => {
            const movieId = 'movieId123';
            const ratings = [{ userId: 'userId123', value: 4 }];
            Rating.find.mockResolvedValue(ratings);

            const result = await RatingService.getRatingsByMovie(movieId);

            expect(result).toEqual(ratings);
            expect(Rating.find).toHaveBeenCalledWith({ movieId, isDeleted: false });
        });
    });

    describe('deleteRating', () => {
        it('should delete a rating successfully', async () => {
            const ratingId = 'ratingId123';
            const deletedRating = { id: ratingId, isDeleted: true };
            Rating.findByIdAndUpdate.mockResolvedValue(deletedRating);

            const result = await RatingService.deleteRating(ratingId);

            expect(result).toEqual(deletedRating);
            expect(Rating.findByIdAndUpdate).toHaveBeenCalledWith(ratingId, { isDeleted: true }, { new: true });
        });

        it('should throw an ApiError if rating not found', async () => {
            const ratingId = 'nonexistentRatingId';
            Rating.findByIdAndUpdate.mockResolvedValue(null);

            await expect(RatingService.deleteRating(ratingId))
        });
    });

    describe('getUserRating', () => {
        it('should return the user rating for a movie', async () => {
            const userId = 'userId123';
            const movieId = 'movieId123';
            const rating = { userId, movieId, value: 4 };
            Rating.findOne.mockResolvedValue(rating);

            const result = await RatingService.getUserRating(userId, movieId);

            expect(result).toEqual(rating);
            expect(Rating.findOne).toHaveBeenCalledWith({ userId, movieId, isDeleted: false });
        });

        it('should return null if the user has not rated the movie', async () => {
            const userId = 'userId123';
            const movieId = 'movieId123';
            Rating.findOne.mockResolvedValue(null);

            const result = await RatingService.getUserRating(userId, movieId);

            expect(result).toBeNull();
        });
    });
});