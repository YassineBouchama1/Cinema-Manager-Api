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



exports.updateReservationValidator = [
    check('id')
        .isMongoId().withMessage('Invalid reservation ID'),

    // custom validation to check if the show belonging to the reservation starts within the next 30 min
    check('id').custom(async (id, { req }) => {
        try {
            // if admin wants to execute this operation, no need to validate
            if (req.user.role === 'admin') return true;

            const reservation = await ReservationModel.findById(id)
                .populate({
                    path: 'showTimeId',
                    select: 'startAt'
                });

            if (!reservation) {
                throw new Error('Reservation not found');
            }

            // access the startAt time
            const showTimeStartAt = reservation.showTimeId ? reservation.showTimeId.startAt : null;

            // check if there is a valid startAt time
            if (!showTimeStartAt) {
                throw new Error('No show starts at the specified time.');
            }

            // assign reservation to the resource so it can be accessed in the controller
            req.resource = reservation;

            const now = new Date();
            const thirtyMinutesFromNow = new Date(now.getTime() - 30 * 60 * 1000); // current time + 30 min

            // check if the reservation startAt time is within the next 30 min
            if (showTimeStartAt >= thirtyMinutesFromNow) {
                throw new Error("You can't update the show that will start soon. You have less than 30 minutes before the show starts.");
            }

            return true;
        } catch (error) {
            throw new Error(`Error checking reservation time: ${error.message}`);
        }
    }),

    validatorMiddleware,
];
