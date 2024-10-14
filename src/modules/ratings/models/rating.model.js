const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
    value: {
        type: Number,
        required: [true, 'Rating value is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must be at most 5'],
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: [true, 'User ID is required'],
    },
    movieId: {
        type: mongoose.Schema.ObjectId,
        ref: 'movie',
        required: [true, 'Movie ID is required'],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const Rating = mongoose.model('rating', ratingSchema);

module.exports = Rating;