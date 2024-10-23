const express = require('express');
const { protect } = require('../../middleware/auth.middleware');
const { createRating, getRatingsByMovie, deleteRating, getUserRating } = require('./rating.controller');
const { ratingByIdValidator } = require('./rating.validator');

const router = express.Router();

router.route('/')
    .post(protect, createRating);

router.route('/movie/:movieId')
    .get(getRatingsByMovie);

router.route('/:id')
    .delete(protect, ratingByIdValidator, deleteRating);



// thisto  get user rating for a specific movie
router.route('/user/:movieId')
    .get(protect, getUserRating);
module.exports = router;