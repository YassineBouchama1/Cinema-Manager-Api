const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    text: {
        type: String,
        required: [true, 'text comment is required'],
        minlength: [2, 'text comment is too short'],
        index: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: [true, 'userId is required'],
    },
    movieId: {
        type: mongoose.Schema.ObjectId,
        ref: 'movie',
        required: [true, 'movieId is required'],
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;