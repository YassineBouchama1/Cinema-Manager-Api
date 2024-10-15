const Movie = require('../models/movie.model');
const ApiError = require('../../../utils/ApiError');
const sharp = require('sharp');
const minioClient = require('../../../config/minioClient.config');
const Rating = require('../../ratings/models/rating.model');
const ShowTime = require('../../showtimes/models/showtime.model');

class MovieService {
    async uploadMedia(req) {
        const timestamp = Date.now();
        const randomId = Math.round(Math.random() * 1E9);
        const mediaData = {};

        // Handle image upload
        if (req.files.image) {
            const imageFile = req.files.image[0];
            const imageFileName = `movies/images/${req.body.name}-${timestamp}-${randomId}.png`;

            // Resize and upload image
            const imageBuffer = await sharp(imageFile.buffer).toBuffer();
            await minioClient.putObject('cinema', imageFileName, imageBuffer);
            mediaData.image = `/cinema/${imageFileName}`;
        }

        // Handle video upload if provided
        if (req.files.video) {
            const videoFile = req.files.video[0];
            const videoFileName = `movies/videos/${req.body.name}-${timestamp}-${randomId}.mp4`;

            // Upload video
            await minioClient.putObject('cinema', videoFileName, videoFile.buffer);
            mediaData.video = `/cinema/${videoFileName}`;
        }

        return mediaData;
    }


    async createMovie(movieData) {
        const newMovie = new Movie(movieData);
        try {
            const savedMovie = await newMovie.save();
            return savedMovie;
        } catch (error) {
            throw new ApiError(`Error Creating Movie: ${error.message}`, 500);
        }
    }

    async viewMovie(id, userId) {
        const movie = await Movie.findById(id).select('name genre image rating duration id video');;

        if (!movie) {
            throw new ApiError(`No resource found with this ID`, 404);
        }


        // Fetch the user's rating if userId is provided
        let userRating = null;
        if (userId) {
            const rating = await Rating.findOne({ userId, movieId: id, isDeleted: false });
            userRating = rating ? rating.value : null; // Get the rating value or null if not rated
        }

        return { movie, userRating };

    }

    async viewMovieStreaming(id) {
        const movie = await Movie.findById(id).select('name genre image rating duration  id video');

        if (!movie) {
            throw new ApiError(`No resource found with this ID`, 404);
        }
        return movie;
    }

    async deleteMovie(id) {
        const result = await Movie.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!result) {
            throw new ApiError(`Error Deleting Movie: Movie not found`, 404);
        }

        // mrk all associated showtimes as deleted
        await ShowTime.updateMany({ movieId: id }, { isDeleted: true });

        return result;
    }

    async updateMovie(id, updateData) {
        const movieUpdated = await Movie.findByIdAndUpdate(id, updateData, { new: true });
        if (!movieUpdated) {
            throw new ApiError(`Error Updating Movie: Movie not found`, 404);
        }
        return movieUpdated;
    }

    async viewMovies(conditions) {
        const movies = await Movie.find(conditions).select('name genre image rating duration');
        return movies;
    }
}

module.exports = new MovieService();