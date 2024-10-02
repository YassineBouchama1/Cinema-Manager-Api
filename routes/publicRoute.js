const express = require('express');
const {
    viewShowTimesPublic,
    viewShowTime
} = require('../controllers/showtimeController');
const { viewMoviesPublic, viewMoviePublic } = require('../controllers/movieController');
const { viewCinemaPublic, viewCinemasPublic } = require('../controllers/cinemaController');

const router = express.Router();


//@desc : routs un auth users 


//@Path  : Public/showtime

router.route('/showTime/:id')
    .get(viewShowTime)



//@Path  : Public/movie
router.route('/movie')
    .get(viewMoviesPublic);

router.route('/movie/:id')
    .get(viewMoviePublic);


//@Path  : Public/cinema
router.route('/cinema/:id')
    .get(viewCinemaPublic) // bring all showTimes belong this cinema


//@Path  : Public/cinema : bring all cinema
router.route('/cinema')
    .get(viewCinemasPublic)




module.exports = router;
