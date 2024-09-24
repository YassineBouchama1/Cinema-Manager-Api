const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validator');
const ReservationModel = require('../../models/reservationModel');

exports.createReservationValidator = [
    check('seats')
        .isArray({ min: 1 })
        .withMessage('At least one seat is required')
        .custom((value) => {
            if (!value.every(Number.isInteger)) { // make sure  they passed numbers
                throw new Error('All seats must be integers');
            }
            return true;
        })


        .custom(async (seats, { req }) => {
            const { showTimeId } = req.body;

            try {
                // fetch reservations for the given showTimeId
                const reservations = await ReservationModel.find({ showTimeId });

                // check if there are any reservations
                if (reservations.length === 0) {

                    // ff no reservations, all seats are free
                    return true;
                }



                // extract reserved seats from reservations
                const reservedSeats = reservations.flatMap(reservation => reservation.seats);

                // check if any of the requested seats are already reserved
                const isSeatReserved = seats.some(seat => reservedSeats.includes(seat));

                if (isSeatReserved) {
                    throw new Error('Some seats are already reserved');

                }

                return true;
            } catch (error) {
                // hanlde unexpected errors
                throw new Error(`Error Creating reservations : ${error}`);
            }
        }),


    check('showTimeId')
        .notEmpty()
        .withMessage('Showtime ID is required')
        .isMongoId()
        .withMessage('Invalid Showtime ID'),

    validatorMiddleware,
];
