const express = require('express');
const { protect } = require('../../../middleware/auth.middleware');
const { createRating, getRatingsByMovie, deleteRating } = require('../controllers/rating.controller');
const { ratingByIdValidator } = require('../validators/rating.validator');

const router = express.Router();

router.route('/')
    .post(protect, createRating);

router.route('/movie/:movieId')
    .get(getRatingsByMovie);

router.route('/:id')
    .delete(protect, ratingByIdValidator, deleteRating);

module.exports = router;