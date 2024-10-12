const express = require('express');
const { protect, allowedTo } = require('../middleware/auth.middleware');
const {
    createReservation,
    deleteReservation,
    viewReservations,
    viewReservation,
    updateReservation,
    viewUserReservations
} = require('../controllers/reservationController');
const { createReservationValidator, updateReservationValidator } = require('../validators/reservationValidator');
const checkUserAccessToResource = require('../middleware/accessControl');
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
