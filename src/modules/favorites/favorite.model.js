const mongoose = require('mongoose');

const favoriteSchema = mongoose.Schema({
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

const Favorite = mongoose.model('favorite', favoriteSchema);

module.exports = Favorite;