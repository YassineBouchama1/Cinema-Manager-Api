const Reservation = require('./reservation.model');
const ShowTime = require('../showtimes/showtime.model');
const ApiError = require('../../utils/ApiError');

class ReservationService {
    async createReservation(reservationData) {
        const { seats, showTimeId, userId } = reservationData;

        // Check if showtime exists
        const showTime = await ShowTime.findById(showTimeId);
        if (!showTime) {
            throw new ApiError('Showtime not found', 404);
        }

        const totalPrice = showTime.price * seats.length;

        const newReservation = new Reservation({
            userId,
            showTimeId,
            seats,
            totalPrice,
        });

        try {
            const savedReservation = await newReservation.save();
            return savedReservation;
        } catch (error) {
            throw new ApiError(`Error Creating Reservation: ${error.message}`, 500);
        }
    }

    async updateReservation(id) {
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            throw new ApiError(`Reservation not found`, 404);
        }


        // Update the reservation status
        const updatedStatus = reservation.status === 'active' ? 'cancel' : 'active';
        reservation.status = updatedStatus;

        try {
            const updatedReservation = await reservation.save();
            return updatedReservation;
        } catch (error) {
            throw new ApiError(`Error Updating Reservation: ${error.message}`, 500);
        }
    }

    async deleteReservation(id) {
        const result = await Reservation.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!result) {
            throw new ApiError(`Error Deleting Reservation: Reservation not found`, 404);
        }
        return result;
    }

    async viewUserReservations(userId) {
        const reservations = await Reservation.find({ userId }).populate({
            path: 'showTimeId',
            populate: [
                { path: 'movieId', select: 'name duration category image' },
                { path: 'roomId', select: 'name' },
            ],
        });

        return reservations;
    }

    async viewAdminReservations() {
        const reservations = await Reservation.find().populate({
            path: 'showTimeId',
            populate: [
                { path: 'movieId', select: 'name as movieName  image as imageMovie' },
                { path: 'roomId', select: 'name capacity' },
            ]
        }).populate({
            path: 'userId',
            select: 'name'
        });

        return reservations;
    }

    async viewReservation(id) {
        const reservation = await Reservation.findById(id).populate({
            path: 'showTimeId',
            populate: [
                { path: 'movieId', select: 'name duration category image' },
                { path: 'roomId', select: 'name capacity' },
            ],
        });

        if (!reservation) {
            throw new ApiError('Reservation not found', 404);
        }

        return reservation;
    }
}

module.exports = new ReservationService();