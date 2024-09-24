const express = require('express');
const { protect, allowedTo } = require('../middlewares/guard');
const {
    createReservation,
    deleteReservation,
    viewReservations,
    viewReservation,
    updateReservation,
    viewUserReservations
} = require('../controller/reservationController');
const { createReservationValidator, updateReservationValidator } = require('../utils/validators/reservationValidator');
const checkUserAccessToResource = require('../middlewares/accessControl');
const ReservationModel = require('../models/reservationModel');

const router = express.Router();

router.route('/')
    .post(protect, allowedTo('user'), createReservationValidator, createReservation)
    .get(protect, allowedTo('user'), viewUserReservations);



router.route('/:id')
    .get(protect, allowedTo('user', 'admin', 'super'), checkUserAccessToResource(ReservationModel), viewReservation)
    .put(protect, allowedTo('user', 'admin', 'super'), updateReservationValidator, updateReservation)
    .delete(protect, allowedTo('admin', 'super'), checkUserAccessToResource(ReservationModel), deleteReservation);


module.exports = router;
