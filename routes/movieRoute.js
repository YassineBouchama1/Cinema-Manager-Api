const express = require('express');
const { protect, allowedTo } = require('../middlewares/guard');
const { createMovie, deleteMovie, viewMovies, viewMovie, updateMovie, viewMoviesPublic, viewMoviePublic, imageUploaderMovie, resizeImage } = require('../controller/movieController');
const { createMovieValidator, movieByIdValidator } = require('../utils/validators/movieValidator');
const checkUserAccessToResource = require('../middlewares/accessControl');
const movieModel = require('../models/movieModel');
const upload = require('../middlewares/uploadimg');

const router = express.Router();


//checkUserAccessToResource : is middleware deteremin weather user have access for this route or not
//upload.single('image'): image is filed thad you passed image file on it


// @access  : Private : Admin
router.route('/')
    .post(protect, imageUploaderMovie, resizeImage, createMovieValidator, allowedTo('admin', 'super'), createMovie)
    .get(protect, allowedTo('admin', 'super'), viewMovies);

router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), movieByIdValidator, checkUserAccessToResource(movieModel), deleteMovie)
    .get(protect, allowedTo('admin', 'super'), movieByIdValidator, checkUserAccessToResource(movieModel), viewMovie)
    .put(protect, allowedTo('admin', 'super'), movieByIdValidator, imageUploaderMovie, resizeImage, checkUserAccessToResource(movieModel), updateMovie);


// @access  : Public
router.route('/public')
    .get(viewMoviesPublic);

router.route('/public/:id')
    .get(viewMoviePublic);

module.exports = router;
