const express = require('express');
const { protect } = require('../middlewares/guard');
const {
    createReservation,
    deleteReservation,
    viewReservations,
    viewReservation,
    cancelReservation
} = require('../controller/reservationController');
const { createReservationValidator } = require('../utils/validators/reservationValidator');
const checkUserAccessToResource = require('../middlewares/accessControl');
const ReservationModel = require('../models/reservationModel');

const router = express.Router();

router.route('/')
    .post(protect, createReservationValidator, createReservation)
    .get(protect, viewReservations);

router.route('/:id')
    .get(protect, checkUserAccessToResource(ReservationModel), viewReservation)
    .put(protect, checkUserAccessToResource(ReservationModel), cancelReservation)
    .delete(protect, checkUserAccessToResource(ReservationModel), deleteReservation);

module.exports = router;
