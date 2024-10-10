const express = require('express');

const { showTimesBelongMovie, viewShowTimesPublic } = require('../controllers/showtimeController');

const router = express.Router();




//@Path  : Public/movie
router.route('/showtime')
    .get(viewShowTimesPublic);

router.route('/showtime/:id')
    .get(showTimesBelongMovie);






module.exports = router;
