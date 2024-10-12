const expressAsyncHandler = require('express-async-handler');
const ReservationModel = require('../models/reservationModel');
const ShowTimeModel = require('../models/showTimeModel');
const ApiError = require('../utils/ApiError');
const dbOps = require('../utils/DatabaseOperations');
const sendEmail = require('../utils/email/sendEmail');
const { confirmationTemplate } = require('../utils/email/templates/confirmationTemplate');
const { logEmailError } = require('../utils/logger');


// @desc    Create a new reservation
// @route   POST /api/v1/reservation
// @access  Private
exports.createReservation = expressAsyncHandler(async (req, res, next) => {
    const { seats, showTimeId } = req.body;
    const { id: userId, email, name } = req.user;


    //valid show time id :DONE
    //check of seats empty : DONE
    //calcul total price : DONE


    // check if showtime exists
    const showTimeResult = await dbOps.findOne(ShowTimeModel, { _id: showTimeId });

    if (!showTimeResult || !showTimeResult.data) {
        return next(new ApiError('Showtime not found', 404));
    }


    let totalPrice = showTimeResult.data.price * seats?.length

    const reservationData = {
        userId,
        showTimeId,
        seats,
        totalPrice
    };

    try {

        const result = await dbOps.insert(ReservationModel, reservationData);

        if (result?.error) {
            return next(new ApiError(`Error Creating Reservation: ${result.error}`, 500));
        }

        // prepare template that send to user 
        const html = await confirmationTemplate(name, totalPrice, seats, result.data._id)


        // send email confirmation
        const isEmailSent = await sendEmail({ email, html, subject: 'Confirmation Reservation' })


        // chekc if email sent
        if (!isEmailSent.success) {
            // if there is error sening email 
            //TODO:remve previews reservation or add thsi to mq

            // Log email error using the utility
            logEmailError({ userId, email, name, error: isEmailSent.error, category: 'Confirmaton Resrvation' });

            return next(new ApiError(`Error sending email Confirmation`, 500));
        }

        res.status(201).json({ data: result.data, message: 'Reservation created successfully' });
    } catch (error) {
        return next(new ApiError(`Error Creating Reservation: ${error.message}`, 500));
    }
});




// @route   PUT /api/v1/reservation/:id
// @access  Private : user - admin - super admin
exports.updateReservation = expressAsyncHandler(async (req, res, next) => {


    // req.resource is reservation item / watch accessControl file
    let { id } = req.params;





    try {

        // fetch reservation with id 
        const reservationResult = await dbOps.findOne(ReservationModel, { _id: id });



        if (reservationResult?.error | !reservationResult.data) {
            return next(new ApiError(`reservation not found : ${reservationResult.error}`, 500));
        }


        let reservation = reservationResult.data


        // Update the reservation status
        const reservationUpdated = await dbOps.update(
            ReservationModel,
            { _id: reservation.id }, // resource comes from middleware accessControl.js
            { status: reservation.status === 'active' ? 'cancel' : reservation.status }, // update only the status
            { new: true }
        );

        if (reservationUpdated?.error) {
            return next(new ApiError(`Error Canceling Reservation: ${reservationUpdated.error}`, 500));
        }

        res.status(200).json(reservationUpdated); // return the updated reservation
    } catch (error) {
        return next(new ApiError(`Error Updating Reservation: ${error.message}`, 500));
    }
});








// @desc    Delete a reservation
// @route   DELETE /api/v1/reservation/:id
// @access  Private
exports.deleteReservation = expressAsyncHandler(async (req, res, next) => {

    //req.resource is reservation item / watch accessControl file
    let reservation = req.resource

    const result = await dbOps.softDelete(ReservationModel, { _id: reservation.id });

    if (result?.error) {
        return next(new ApiError(`Error Deleting Reservation: ${result.error}`, 500));
    }
    res.status(200).json(result);
});



// @desc    Get all reservations for a user
// @route   GET /api/v1/reservation
// @access  Private : user
exports.viewUserReservations = expressAsyncHandler(async (req, res, next) => {
    const { id: userId } = req.user;



    const populateOptions = [
        {
            path: 'showTimeId',
            populate: [
                { path: 'movieId', select: 'name duration category image' },
                { path: 'roomId', select: 'name' }
            ]
        }
    ];

    const result = await dbOps.select(ReservationModel, { userId }, populateOptions);
    if (result?.error) {
        return next(new ApiError(`Error Fetching Reservations: ${result.error}`, 500));
    }

    // transform the data to include only necessary fields
    const transformedData = result.data.map(reservation => ({
        reservationId: reservation._id,
        showTime: {
            startAt: reservation.showTimeId.startAt,
            endAt: reservation.showTimeId.endAt,
            price: reservation.showTimeId.price,
            movie: {
                name: reservation.showTimeId.movieId.name,
                duration: reservation.showTimeId.movieId.duration,
                category: reservation.showTimeId.movieId.category,
                image: reservation.showTimeId.movieId.image
            },
            room: {
                name: reservation.showTimeId.roomId.name
            }
        },
        seats: reservation.seats,
        totalPrice: reservation.totalPrice,
        status: reservation.status
    }));

    res.status(200).json({ data: transformedData });
});




// @desc    Get all reservations 
// @route   GET /api/v1/reservation
// @access  Private : admin
exports.viewAdminReservations = expressAsyncHandler(async (req, res, next) => {


    // bring all reservations belong this cinema
    const result = await dbOps.select(ReservationModel);
    if (result?.error) {
        return next(new ApiError(`Error Fetching Reservations: ${result.error}`, 500));
    }

    res.status(200).json({ data: result.data });
});



// @desc    Get a single reservation by ID
// @route   GET /api/v1/reservation/:id
// @access  Private
exports.viewReservation = expressAsyncHandler(async (req, res, next) => {

    const { id } = req.params



    // determin bring schemas that associated with reservation
    const populateOptions = {
        path: 'showTimeId',
        populate: [
            { path: 'movieId', select: 'name duration category image' },
            { path: 'roomId', select: 'name capacity' }
        ]
    };


    try {
        const reservation = await dbOps.findOne(ReservationModel, { _id: id }, populateOptions)


        if (!reservation || !reservation.data) {
            return next(new ApiError('reservation belong this id not found', 404));
        }


        res.status(200).json(reservation);

    } catch (error) {
        return next(new ApiError(`Error Fetching Showtime: ${error.message}`, 500));
    }
});





