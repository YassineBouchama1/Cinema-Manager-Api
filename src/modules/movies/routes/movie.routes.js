const express = require('express');
const { protect, allowedTo } = require('../../../middleware/auth.middleware');
const { uploadMedia, createMovie, deleteMovie, updateMovie, viewMovie, viewMovies } = require('../controllers/movie.controller');
const upload = require('../../../middleware/upload.middleware');
const Movie = require('../models/movie.model');
const checkUserAccessToResource = require('../../../middleware/accessControl.middleware');
const { movieByIdValidator, createMovieValidator, updateMovieValidator } = require('../validators/movie.validator');


const router = express.Router();


//checkUserAccessToResource : is middleware deteremin weather user have access for this route or not
//upload.single('image'): image is filed thad you passed image file on it


// @access  : Private : Admin
router.route('/')
    .post(protect, allowedTo('admin', 'super'), upload, uploadMedia, createMovieValidator ,createMovie)
    // .post(protect, allowedTo('admin', 'super'),  createMovieValidator,createMovie)
    .get(viewMovies);

router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), movieByIdValidator, checkUserAccessToResource(Movie), deleteMovie)
    .get(protect, allowedTo('admin', 'super'), movieByIdValidator, checkUserAccessToResource(Movie), viewMovie)
    .put(protect, allowedTo('admin', 'super'), updateMovieValidator, upload, uploadMedia, checkUserAccessToResource(Movie), updateMovie);





module.exports = router;
