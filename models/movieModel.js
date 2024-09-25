const mongoose = require('mongoose');
const dbOps = require('../utils/DatabaseOperations');



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
    cinemaId: {
        type: mongoose.Schema.ObjectId,
        ref: 'cinema',
        required: [true, 'cinema id is required'],
    },
    category: {
        type: String,
        enum: ['action', 'comedy', 'drama', 'horror', 'romance', 'thriller', 'animation'],
        required: [true, 'Category movie is required'],
    },
    image: {
        type: String,
        required: [true, 'Movie image URL is required'],
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


const movieModel = dbOps.createModel('movie', movieSchema)

module.exports = movieModel





