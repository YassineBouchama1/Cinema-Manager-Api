const express = require('express');
const { protect, allowedTo } = require('../../../middleware/auth.middleware');
const { createShowTimeValidator, showTimeByIdValidator } = require('../validators/showtime.validator');
const { createShowTime, viewShowTimes, deleteShowTime, updateShowTime, viewShowTimesPublic, showTimesBelongMovie } = require('../controllers/showtime.controller');
const checkUserAccessToResource = require('../../../middleware/accessControl.middleware');
const ShowTime = require('../models/showtime.model');


const router = express.Router();



// @access  : Private : Admin
router.route('/')
    .post(protect, allowedTo('admin', 'super'), createShowTimeValidator, createShowTime)
    .get(protect, allowedTo('admin', 'super'), viewShowTimes); // bring showtimes belong cinema


//@access Public 
router.route('/public')
    .get(viewShowTimesPublic);

router.route('/public/:id')
    .get(showTimesBelongMovie);

router.route('/:id')

    .put(protect, allowedTo('admin', 'super'), showTimeByIdValidator, checkUserAccessToResource(ShowTime), updateShowTime)
    .delete(protect, allowedTo('admin', 'super'), checkUserAccessToResource(ShowTime), deleteShowTime);







module.exports = router;

















module.exports = router;
