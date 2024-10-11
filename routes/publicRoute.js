const express = require('express');

const { showTimesBelongMovie, viewShowTimesPublic } = require('../controllers/showtimeController');
const { getOneMoviePublic, viewMovies } = require('../controllers/movieController');

const router = express.Router();




//@Path  : Public/movie
router.route('/showtime')
    .get(viewShowTimesPublic);

router.route('/showtime/:id')
    .get(showTimesBelongMovie);



router.route('/movie/:id')
    .get(getOneMoviePublic)


router.route('/movie')
    .get(viewMovies)








module.exports = router;
