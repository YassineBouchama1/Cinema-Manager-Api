const express = require('express');
const { protect } = require('../../../middleware/auth.middleware');
const { createComment, getCommentsByMovie, deleteComment } = require('../controllers/comment.controller');
const { commentByIdValidator } = require('../validators/comment.validator');

const router = express.Router();

router.route('/')
    .post(protect, createComment);

router.route('/movie/:movieId')
    .get(getCommentsByMovie);

router.route('/:id')
    .delete(protect, commentByIdValidator, deleteComment);

module.exports = router;