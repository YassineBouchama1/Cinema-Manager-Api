const expressAsyncHandler = require('express-async-handler');
const CommentService = require('./comment.service');
const ApiError = require('../../utils/ApiError');

// @desc    Create a new comment
// @route   POST /api/v1/comments
// @access  Private
exports.createComment = expressAsyncHandler(async (req, res, next) => {
    try {
        const commentData = await CommentService.createComment({ ...req.body, userId: req.user.id });
        res.status(201).json({ data: commentData, message: 'Comment created successfully' });
    } catch (error) {
        return next(new ApiError(`Error Creating Comment: ${error.message}`, 500));
    }
});

// @desc    Get all comments for a movie
// @route   GET /api/v1/comments/movie/:movieId
// @access  Public
exports.getCommentsByMovie = expressAsyncHandler(async (req, res, next) => {
    try {
        const comments = await CommentService.getCommentsByMovie(req.params.movieId);

        const formattedComments = comments.map(comment => ({
            id: comment._id,
            movieId: req.params.movieId,
            text: comment.text,
            name: comment.userId.name,
            userId: comment.userId.id,
            avatar: 'https://flowbite.com/docs/images/people/profile-picture-5.jpg',
            date: new Date(comment.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })
        }));

        res.status(200).json({ data: formattedComments });
    } catch (error) {
        return next(new ApiError(`Error fetching comments: ${error.message}`, 500));
    }
});

// @desc    Delete a comment
// @route   DELETE /api/v1/comments/:id
// @access  Private
exports.deleteComment = expressAsyncHandler(async (req, res, next) => {
    try {
        const result = await CommentService.deleteComment(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        return next(new ApiError(`Error deleting comment: ${error.message}`, 500));
    }
});