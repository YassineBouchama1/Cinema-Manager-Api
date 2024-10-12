const express = require('express');
const { protect, allowedTo } = require('../middleware/auth.middleware');
const {
    createShowTime,
    updateShowTime,
    viewShowTimes,
    deleteShowTime
} = require('../controllers/showtimeController');
const {
    createShowTimeValidator,
    showTimeByIdValidator,
} = require('../validators/showtimeValidator');
const ShowTimeModel = require('../models/showTimeModel');
const checkUserAccessToResource = require('../middleware/accessControl');


const router = express.Router();

// @access  : Private : Admin
router.route('/')
    .post(protect, allowedTo('admin', 'super'), createShowTimeValidator, createShowTime)
    .get(protect, allowedTo('admin', 'super'), viewShowTimes); // bring showtimes belong cinema

router.route('/:id')

    .put(protect, allowedTo('admin', 'super'), showTimeByIdValidator, checkUserAccessToResource(ShowTimeModel), updateShowTime)
    .delete(protect, allowedTo('admin', 'super'), checkUserAccessToResource(ShowTimeModel), deleteShowTime);





module.exports = router;
