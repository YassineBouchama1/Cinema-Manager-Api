const express = require('express');
const { protect, allowedTo, getUserFromToken } = require('../../../middleware/auth.middleware');
const { createMovie, deleteMovie, updateMovie, viewMovie, viewMovies, uploadMedia, viewMovieStreaming, streamMovie } = require('../controllers/movie.controller');
const upload = require('../../../middleware/upload.middleware');
const Movie = require('../models/movie.model');
const checkUserAccessToResource = require('../../../middleware/accessControl.middleware');
const { movieByIdValidator, createMovieValidator, updateMovieValidator } = require('../validators/movie.validator');


const router = express.Router();


router.route('/stream/:id')

    .get(streamMovie)


// @access  : Private : Admin
router.route('/')
    .post(protect, allowedTo('admin', 'super'), upload, uploadMedia, createMovieValidator, createMovie)

    .get(getUserFromToken, viewMovies);






router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), movieByIdValidator, checkUserAccessToResource(Movie), deleteMovie)
    .get(movieByIdValidator, getUserFromToken, viewMovie) //getUserFromToken is middle war help us get user info if token procider 
    .put(protect, allowedTo('admin', 'super'), updateMovieValidator, upload, uploadMedia, checkUserAccessToResource(Movie), updateMovie);





module.exports = router;
