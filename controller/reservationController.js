const expressAsyncHandler = require('express-async-handler');
const ReservationModel = require('../models/reservationModel');
const ShowTimeModel = require('../models/showTimeModel');
const ApiError = require('../utils/ApiError');
const DatabaseOperations = require('../utils/DatabaseOperations');

const dbOps = DatabaseOperations.getInstance();

// @desc    Create a new reservation
// @route   POST /api/v1/reservation
// @access  Private
exports.createReservation = expressAsyncHandler(async (req, res, next) => {
    const { seats, showTimeId } = req.body;
    const { userId } = req.user;


    //valid show time id :DONE
    //check of seats empty : DONE
    //calcul total price : DONE


    // check if showtime exists
    const showTimeResult = await dbOps.findOne(ShowTimeModel, { _id: showTimeId });

    if (!showTimeResult || !showTimeResult.data) {
        return next(new ApiError('Showtime not found', 404));
    }




    const reservationData = {
        userId,
        showTimeId,
        seats,
        totalPrice: showTimeResult.data.price * seats?.length
    };

    try {

        const result = await dbOps.insert(ReservationModel, reservationData);

        if (result?.error) {
            return next(new ApiError(`Error Creating Reservation: ${result.error}`, 500));
        }
        res.status(201).json({ data: result.data, message: 'Reservation created successfully' });
    } catch (error) {
        return next(new ApiError(`Error Creating Reservation: ${error.message}`, 500));
    }
});




// @route   PUT /api/v1/reservation/:id
// @access  Private : user - admin - super admin
exports.updateReservation = expressAsyncHandler(async (req, res, next) => {

    const { status } = req.body

    //req.resource is reservation item / watch accessControl file
    let reservation = req.resource


    const reservationUpdated = await dbOps.update(
        ReservationModel,
        { _id: reservation.id }, // resource comes from middlewar accessControle.ks
        { status },
        { new: true }
    );

    if (reservationUpdated?.error) {
        return next(new ApiError(`Error Canceling Reservation: ${movieUpdated.error}`, 500));
    }

    res.status(200).json(updatedReservation);
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
    const { userId } = req.user;

    const result = await dbOps.select(ReservationModel, { userId });
    if (result?.error) {
        return next(new ApiError(`Error Fetching Reservations: ${result.error}`, 500));
    }

    res.status(200).json({ data: result.data });
});




// @desc    Get all reservations belong cinema
// @route   GET /api/v1/reservation
// @access  Private : user
exports.viewAdminReservations = expressAsyncHandler(async (req, res, next) => {
    const { cinemaId } = req.user;


    // bring all reservations belong this cinema
    const result = await dbOps.select(ReservationModel, { cinemaId });
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

    try {
        const reservation = await dbOps.findOne(ShowTimeModel, { _id: id })
            .populate({
                path: 'showTimeId',
                populate: [
                    { path: 'movieId', select: 'name duration category' },
                    { path: 'roomId', select: 'name capacity' }
                ]
            });
        if (!reservation) {
            return next(new ApiError('reservation not found', 404));
        }

        res.status(200).json({ data: reservation });
    } catch (error) {
        return next(new ApiError(`Error Fetching Showtime: ${error.message}`, 500));
    }
});





