const Movie = require('../models/movie.model');
const ApiError = require('../../../utils/ApiError');
const sharp = require('sharp');
const minioClient = require('../../../config/minioClient.config');

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

    async viewMovie(id) {
        const movie = await Movie.findById(id).select('name genre image rating duration id video');;

        if (!movie) {
            throw new ApiError(`No resource found with this ID`, 404);
        }
        return movie;
    }

    async viewMovieStreaming(id) {
        const movie = await Movie.findById(id).select('name genre image rating duration  id video');;

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
        const movies = await Movie.find(conditions).select('name genre image rating');
        return movies;
    }
}

module.exports = new MovieService();