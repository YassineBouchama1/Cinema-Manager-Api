const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../../utils/ApiError');
const ReservationService = require('./reservation.service');
const sendEmail = require('../../utils/email/sendEmail');
const { confirmationTemplate } = require('../../utils/email/templates/confirmationTemplate');
const { logEmailError } = require('../../utils/logger');

// @desc    Create a new reservation
// @route   POST /api/v1/reservation
// @access  Private
exports.createReservation = expressAsyncHandler(async (req, res, next) => {
    const { seats, showTimeId } = req.body;
    const { id: userId, email, name } = req.user;

    try {
        const reservationData = await ReservationService.createReservation({
            seats,
            showTimeId,
            userId,
        });

        // Prepare template that send to user 
        const html = await confirmationTemplate(name, reservationData.totalPrice, seats, reservationData._id);

        // Send email confirmation
        // const isEmailSent = await sendEmail({ email, html, subject: 'Confirmation Reservation' });

        // // Check if email sent
        // if (!isEmailSent.success) {
        //     // Log email error using the utility
        //     logEmailError({ userId, email, name, error: isEmailSent.error, category: 'Confirmation Reservation' });
        //     return next(new ApiError(`Error sending email Confirmation`, 500));
        // }

        // udate therevenues in statistics
        req.statistics.revenue += reservationData.totalPrice; // increment the revenues
        await req.statistics.save(); // Save the update


        res.status(201).json({ data: reservationData, message: 'Reservation created successfully' });
    } catch (error) {
        return next(new ApiError(`Error Creating Reservation: ${error.message}`, 500));
    }
});

// @desc    Update a reservation
// @route   PUT /api/v1/reservation/:id
// @access  Private : user - admin - super admin
exports.updateReservation = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const updatedReservation = await ReservationService.updateReservation(id);
        res.status(200).json(updatedReservation); // Return the updated reservation
    } catch (error) {
        return next(new ApiError(`Error Updating Reservation: ${error.message}`, 500));
    }
});

// @desc    Delete a reservation
// @route   DELETE /api/v1/reservation/:id
// @access  Private
exports.deleteReservation = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await ReservationService.deleteReservation(id);


        res.status(200).json(result);
    } catch (error) {
        return next(new ApiError(`Error Deleting Reservation: ${error.message}`, 500));
    }
});

// @desc    Get all reservations for a user
// @route   GET /api/v1/reservation
// @access  Private : user
exports.viewUserReservations = expressAsyncHandler(async (req, res, next) => {
    const { id: userId } = req.user;

    try {
        const reservations = await ReservationService.viewUserReservations(userId);
        // Transform the data to include only necessary fields
        const transformedData = reservations.map(reservation => ({
            reservationId: reservation._id,
            showTime: {
                startAt: reservation.showTimeId.startAt,
                endAt: reservation.showTimeId.endAt,
                price: reservation.showTimeId.price,
                movie: {
                    name: reservation.showTimeId.movieId.name,
                    duration: reservation.showTimeId.movieId.duration,
                    category: reservation.showTimeId.movieId.category,
                    image: reservation.showTimeId.movieId.image,
                },
                room: {
                    name: reservation.showTimeId.roomId.name,
                },
            },
            seats: reservation.seats,
            totalPrice: reservation.totalPrice,
            status: reservation.status,
        }));

        res.status(200).json({ data: transformedData });
    } catch (error) {
        return next(new ApiError(`Error Fetching Reservations: ${error.message}`, 500));
    }
});

// @desc    Get all reservations 
// @route   GET /api/v1/reservation
// @access  Private : admin
exports.viewAdminReservations = expressAsyncHandler(async (req, res, next) => {
    try {
        const reservations = await ReservationService.viewAdminReservations();
        res.status(200).json({ data: reservations });
    } catch (error) {
        return next(new ApiError(`Error Fetching Reservations: ${error.message}`, 500));
    }
});

// @desc    Get a single reservation by ID
// @route   GET /api/v1/reservation/:id
// @access  Private
exports.viewReservation = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const reservation = await ReservationService.viewReservation(id);
        res.status(200).json(reservation);
    } catch (error) {
        return next(new ApiError(`Error Fetching Reservation: ${error.message}`, 500));
    }
});