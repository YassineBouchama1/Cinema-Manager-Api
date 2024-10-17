const express = require('express');
const { protect } = require('../../../middleware/auth.middleware');
const { addFavorite, getFavoritesByUser, removeFavorite } = require('../controllers/favorite.controller');

const router = express.Router();

router.route('/')
    .post(protect, addFavorite);

router.route('/:id')
    .delete(protect, getFavoritesByUser, removeFavorite);

router.route('/')
    .get(protect, getFavoritesByUser);


module.exports = router;