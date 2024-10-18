const ShowTime = require('./showtime.model');
const Movie = require('../movies/movie.model');
const Room = require('../rooms/room.model');
const ApiError = require('../../utils/ApiError');
const Reservation = require('../reservations/reservation.model');

class ShowTimeService {
    async createShowTime(showTimeData) {
        const { price, movieId, roomId, startAt } = showTimeData;

        // Get movie
        const movie = await Movie.findById(movieId);
        if (!movie) {
            throw new ApiError('Movie not found', 404);
        }

        // Get room
        const room = await Room.findById(roomId);
        if (!room) {
            throw new ApiError('Room not found', 404);
        }

        // Validate and parse startAt
        const parsedStartAt = new Date(startAt);
        if (isNaN(parsedStartAt.getTime())) {
            throw new ApiError('Invalid startAt date format', 400);
        }

        const durationInMinutes = Number(movie.duration);
        if (isNaN(durationInMinutes)) {
            throw new ApiError('Invalid movie duration', 400);
        }

        // Calculate endAt based on movie duration + additional time: 10min
        const durationInMillis = durationInMinutes * 60 * 1000; // convert to milliseconds
        const additionalTime = 10 * 60 * 1000; // 10 minutes in milliseconds
        const endAt = new Date(parsedStartAt.getTime() + durationInMillis + additionalTime);

        const newShowTime = new ShowTime({
            price,
            movieId,
            roomId,
            startAt: parsedStartAt,
            endAt,
        });

        try {
            const savedShowTime = await newShowTime.save();
            return savedShowTime;
        } catch (error) {
            throw new ApiError(`Error Creating Showtime: ${error.message}`, 500);
        }
    }

    async updateShowTime(id, updateData) {
        const showTime = await ShowTime.findById(id);
        if (!showTime) {
            throw new ApiError('Showtime not found', 404);
        }

        // Update the showtime using the update function
        Object.assign(showTime, updateData);
        try {
            const updatedShowTime = await showTime.save();
            return updatedShowTime;
        } catch (error) {
            throw new ApiError(`Error Updating Showtime: ${error.message}`, 500);
        }
    }

    async deleteShowTime(id) {
        const result = await ShowTime.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!result) {
            throw new ApiError('Showtime not found', 404);
        }
        return result;
    }

    async viewShowTimes() {
        const showTimes = await ShowTime.find({ isDeleted: false }).populate([
            { path: 'movieId', select: 'name  image' },
            { path: 'roomId', select: 'name capacity' },
        ]);
        return showTimes;
    }

    async viewShowTimeWithReservations(id) {
        const showTime = await ShowTime.findById(id)
            .populate([
                { path: 'movieId', select: 'name duration category image' },
                { path: 'roomId', select: 'name capacity' },
            ]);

        if (!showTime) {
            throw new ApiError('Showtime not found', 404);
        }

        const reservations = await Reservation.find({ showTimeId: showTime._id });
        return { showTime, reservations };
    }

    async viewShowTimesPublic(conditions) {
        const showTimes = await ShowTime.find(conditions);
        return showTimes;
    }

    async showTimesBelongMovie(movieId) {
        const showtimes = await ShowTime.find({ movieId }).populate('roomId', 'name capacity seatsPerRow');
        return showtimes;
    }
}

module.exports = new ShowTimeService();