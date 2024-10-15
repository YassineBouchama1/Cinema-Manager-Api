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
        const comments = await Comment.find({ movieId, isDeleted: false })
            .select('text userId createdAt')
            .populate('userId', 'name')
            .sort({ createdAt: -1 }); // latest 

        return comments;
    }

    async deleteComment(id,userId) {

        // fnd the comment byid
        const comment = await Comment.findById(id)

        // check if the comment exists
        if (!comment) {
            throw new ApiError(`Error Deleting Comment: Comment not found`, 404);
        }

        // check if the user owns this comment
        if (userId !== comment.userId.toString()) {
            throw new ApiError(`Error Deleting Comment: You do not have permission to delete this comment`, 403);
        }

        // mark the comment as deleted
        const result = await Comment.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

        return result;
    }
}

module.exports = new CommentService();