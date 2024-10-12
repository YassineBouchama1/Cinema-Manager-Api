const mongoose = require('mongoose');

const commentSchema = mongoose.Scheme({
    content: {
        type: String,
        required: [true, 'content is required']
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: [true, 'User ID is required']
    },
    movieId: {
        type: mongoose.Schema.ObjectId,
        ref: 'movie',
        required: [true, 'Movie ID is required']
    }
})


const CommentModel = dbOps.createModel('comment', commentSchema)


module.exports = CommentModel
