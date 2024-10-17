const express = require('express');
const { protect } = require('../../../middleware/auth.middleware');
const { addFavorite, getFavoritesByUser, removeFavorite } = require('../controllers/favorite.controller');

const router = express.Router();

router.route('/')
    .post(protect, addFavorite);

router.route('/user/:userId')
    .get(protect, getFavoritesByUser);

router.route('/:id')
    .delete(protect, getFavoritesByUser, removeFavorite);

module.exports = router;