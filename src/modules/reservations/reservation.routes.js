const express = require('express');
const { protect, allowedTo } = require('../../middleware/auth.middleware');
const { createReservationValidator, updateReservationValidator } = require('./reservation.validator');
const checkUserAccessToResource = require('../../middleware/accessControl.middleware');
const Reservation = require('./reservation.model');
const { createReservation, viewUserReservations, viewReservation, updateReservation, deleteReservation, viewAdminReservations } = require('./reservation.controller');

const router = express.Router();

router.route('/')
    .post(protect, allowedTo('user'), createReservationValidator, createReservation)
    .get(protect, allowedTo('user'), viewUserReservations);

router.route('/admin')
    .get(protect, allowedTo('admin', 'super'), viewAdminReservations);


router.route('/:id')
    .get(protect, allowedTo('user', 'admin', 'super'), checkUserAccessToResource(Reservation), viewReservation)
    .put(protect, allowedTo('user', 'admin', 'super'), updateReservationValidator, updateReservation)
    .delete(protect, allowedTo('admin', 'super'), checkUserAccessToResource(Reservation), deleteReservation);


module.exports = router;
