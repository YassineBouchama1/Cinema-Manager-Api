const express = require('express');

const { viewMoviesPublic, viewMoviePublic } = require('../controllers/movieController');

const router = express.Router();


//@desc : routs un auth users 



//@Path  : Public/movie
router.route('/movie')
    .get(viewMoviesPublic);

router.route('/movie/:id')
    .get(viewMoviePublic);






module.exports = router;
