const express = require('express');
const { protect, allowedTo } = require('../middlewares/guard');
const { createMovie, deleteMovie, viewMovies, viewMovie, updateMovie, viewMoviePublic, imageUploaderMovie, resizeImage, viewMovieAdmin } = require('../controllers/movieController');
const { createMovieValidator, movieByIdValidator } = require('../validators/movieValidator');
const checkUserAccessToResource = require('../middlewares/accessControl');
const movieModel = require('../models/movieModel');

const router = express.Router();


//checkUserAccessToResource : is middleware deteremin weather user have access for this route or not
//upload.single('image'): image is filed thad you passed image file on it


// @access  : Private : Admin
router.route('/')
    .post(protect, imageUploaderMovie, resizeImage, allowedTo('admin', 'super'), createMovie)
    .get(viewMovies);

router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), movieByIdValidator, checkUserAccessToResource(movieModel), deleteMovie)
    .get(protect, allowedTo('admin', 'super'), movieByIdValidator, checkUserAccessToResource(movieModel), viewMovieAdmin)
    .put(protect, allowedTo('admin', 'super'), movieByIdValidator, imageUploaderMovie, resizeImage, checkUserAccessToResource(movieModel), updateMovie);





module.exports = router;
