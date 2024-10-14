const Comment = require('../models/comment.model');
const ApiError = require('../../../utils/ApiError');

class CommentService {
    async createComment(commentData) {
        const newComment = new Comment(commentData);
        try {
            const savedComment = await newComment.save();
            return savedComment;
        } catch (error) {
            throw new ApiError(`Error Creating Comment: ${error.message}`, 500);
        }
    }

    async getCommentsByMovie(movieId) {
        const comments = await Comment.find({ movieId, isDeleted: false });
        return comments;
    }

    async deleteComment(id) {
        const result = await Comment.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!result) {
            throw new ApiError(`Error Deleting Comment: Comment not found`, 404);
        }
        return result;
    }
}

module.exports = new CommentService();