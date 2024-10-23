const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validator.middleware');
const ShowTime = require('../showtimes/showtime.model');
const Reservation = require('./reservation.model');


// Validate fields for creating a reservation
exports.createReservationValidator = [
    check('seats')
        .isArray({ min: 1 })
        .withMessage('At least one seat is required')
        .custom((value) => {
            if (!value.every(Number.isInteger)) {
                throw new Error('All seats must be integers');
            }
            return true;
        })
        .custom(async (seats, { req }) => {
            const { showTimeId } = req.body;

            try {
                const showTime = await ShowTime.findById(showTimeId).populate('roomId');
                if (!showTime) {
                    throw new Error('Showtime not found');
                }

                const room = showTime.roomId;
                if (!room) {
                    throw new Error('Room not found for the specified showtime');
                }

                const reservations = await Reservation.find({ showTimeId });
                const reservedSeats = reservations.flatMap(reservation => reservation.seats);

                const isSeatReserved = seats.some(seat => reservedSeats.includes(seat));
                if (isSeatReserved) {
                    throw new Error('Some seats are already reserved');
                }

                const totalReservedSeats = reservedSeats.length + seats.length;
                if (totalReservedSeats > room.capacity) {
                    throw new Error('Room is fully booked. Cannot reserve more seats.');
                }

                return true;
            } catch (error) {
                throw new Error(`Error creating reservations: ${error.message}`);
            }
        }),

    check('showTimeId')
        .notEmpty()
        .withMessage('Showtime ID is required')
        .isMongoId()
        .withMessage('Invalid Showtime ID'),

    validatorMiddleware,
];

// Validate fields for updating a reservation
exports.updateReservationValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid reservation ID'),

    check('id').custom(async (id, { req }) => {
        try {
            if (req.user.role === 'admin') return true;

            const reservation = await Reservation.findById(id)
                .populate({
                    path: 'showTimeId',
                    select: 'startAt'
                });

            if (!reservation) {
                throw new Error('Reservation not found');
            }

            const showTimeStartAt = reservation.showTimeId ? reservation.showTimeId.startAt : null;
            if (!showTimeStartAt) {
                throw new Error('No show starts at the specified time.');
            }

            req.resource = reservation;

            const now = new Date();
            const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

            if (showTimeStartAt <= thirtyMinutesFromNow) {
                throw new Error("You can't update the show that will start soon. You have less than 30 minutes before the show starts.");
            }

            return true;
        } catch (error) {
            throw new Error(`Error checking reservation time: ${error.message}`);
        }
    }),

    validatorMiddleware,
];