const Movie = require('./movie.model');
const ApiError = require('../../utils/ApiError');
const sharp = require('sharp');
const minioClient = require('../../config/minioClient.config');
const Rating = require('../ratings/rating.model');
const ShowTime = require('../showtimes/showtime.model');
const Favorite = require('../favorites/favorite.model');

class MovieService {
    async uploadMedia(req) {
        const timestamp = Date.now();
        const randomId = Math.round(Math.random() * 1E9);
        const mediaData = {};
        const userName = req.body.name?.replace(/\s+/g, '') || 'avatar';
        // Handle image upload
        if (req.files.image) {
            const imageFile = req.files.image[0];
            const imageFileName = `movies/images/${userName}-${timestamp}-${randomId}.png`;

            // Resize and upload image
            const imageBuffer = await sharp(imageFile.buffer).toBuffer();
            await minioClient.putObject('cinema', imageFileName, imageBuffer);
            mediaData.image = `/cinema/${imageFileName}`;
        }

        // Handle video upload if provided
        if (req.files.video) {
            const videoFile = req.files.video[0];
            const videoFileName = `movies/videos/${userName}-${timestamp}-${randomId}.mp4`;

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
        const movie = await Movie.findById(id).select('name genre image rating duration id video description');

        if (!movie) {
            throw new ApiError(`No resource found with this ID`, 404);
        }

        // fetch the user rating if userId is provided
        let userRating = null;
        if (userId) {
            const rating = await Rating.findOne({ userId, movieId: id, isDeleted: false });
            userRating = rating ? rating.value : null; // return rating value or null if not rated
        }

        // fetch the user favorite if userId is provided
        let userFavorite = null;
        if (userId) {
            const favorite = await Favorite.findOne({ userId, movieId: id, isDeleted: false });
            userFavorite = favorite ? favorite.movieId : null; // return movieId if favorited, else null
        }

        return { movie, userRating, userFavorite };
    }





    async getVideoUrl(movieId) {


        // find the movie by ID 
        const movie = await Movie.findById(movieId).select('video views');

        // check if the movie exists and has a video
        if (!movie || !movie.video) {
            throw new ApiError(`No video found for this movie`, 404);
        }

        // preperd the base URL to the video path
        const baseUrl = 'http://127.0.0.1:9000';
        const videoUrl = `${baseUrl}${movie.video}`;

        // increment the views count
        movie.views += 1;

        // save the updated movie document
        await movie.save();

        // return the full movie stream URL
        return videoUrl;
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

    async viewMovies(conditions, userId) {
        const movies = await Movie.find(conditions).select('name genre image rating duration');

        // if userId is provided, check for favorites
        if (userId) {
            const favorites = await Favorite.find({ userId, isDeleted: false }).select('movieId');
            const favoriteMovieIds = favorites.map(favorite => favorite.movieId.toString());

            // Add a favorite status to each movie
            const moviesWithFavoriteStatus = movies.map(movie => ({
                ...movie.toObject(),
                isFavorite: favoriteMovieIds.includes(movie._id.toString()) // here i check if the movie is in the user favorites
            }));

            return moviesWithFavoriteStatus;
        }

        return movies;
    }
}

module.exports = new MovieService();