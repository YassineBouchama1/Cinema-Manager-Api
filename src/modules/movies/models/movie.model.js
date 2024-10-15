const mongoose = require('mongoose');




const movieSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Name Movie is required'],
        minlegth: [1, 'Name Movie is too short'],
        index: true
    },

    duration: {
        type: String,
        required: [true, 'Movie duration is required'],
        minlength: [1, 'Movie duration is too short']
    },
    description: {
        type: String,
        required: [true, 'Movie description is required'],
        minlength: [10, 'Movie description is too short']
    },
    genre: {
        type: String,
        enum: ['action', 'comedy', 'drama', 'horror', 'romance', 'thriller', 'animation'],
        required: [true, 'genre movie is required'],
    },
    image: {
        type: String,
        required: [true, 'Movie image URL is required'],
    },
    video: {
        type: String,
        default: null
    },
    rating: {
        type: Number,
        default: 0.0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


const Movie = mongoose.model('movie', movieSchema)

module.exports = Movie





