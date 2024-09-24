const express = require('express');
const { protect, allowedTo } = require('../middlewares/guard');
const {
    createShowTime,
    updateShowTime,
    viewShowTimes,
    viewShowTime,
    deleteShowTime,
    viewShowTimesPublic,
} = require('../controller/showtimeController');
const {
    createShowTimeValidator,
    showTimeByIdValidator,
} = require('../utils/validators/showtimeValidator');
const ShowTimeModel = require('../models/showTimeModel');
const checkUserAccessToResource = require('../middlewares/accessControl');


const router = express.Router();

// @access  : Private : Admin
router.route('/')
    .post(protect, allowedTo('admin', 'super'), createShowTimeValidator, createShowTime)
    .get(protect, allowedTo('admin', 'super'), viewShowTimes);

router.route('/:id')
    .get(showTimeByIdValidator, viewShowTime) // public 
    .put(protect, allowedTo('admin', 'super'), showTimeByIdValidator, checkUserAccessToResource(ShowTimeModel), updateShowTime)
    .delete(protect, allowedTo('admin', 'super'), checkUserAccessToResource(ShowTimeModel), deleteShowTime);





module.exports = router;
