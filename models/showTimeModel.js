const mongoose = require('mongoose')
const DatabaseOperations = require('../utils/DatabaseOperations');

const dbOps = DatabaseOperations.getInstance();

const showTimeSchema = mongoose.Schema({

    price: {
        type: Number,
        required: [true, 'price is Required']
    },
    movieId: {
        type: mongoose.Schema.ObjectId,
        ref: 'movie',
        required: [true, 'Movie id is Required']

    },
    cinemaId: {
        type: mongoose.Schema.ObjectId,
        ref: 'cinema',
        required: [true, 'Cienma id is Required']

    },
    roomId: {
        type: mongoose.Schema.ObjectId,
        ref: 'room',
        required: [true, 'Room id is Required']

    },
    startAt: {
        type: Date,
        required: [true, 'Start time is required'],
        index: true
    },
    endAt: {
        type: Date,
        required: [true, 'End time is required'],
        index: true,
        validate: {
            validator: function (value) {
                return value > this.startAt;
            },
            message: 'End time must be after start time'
        }
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


const ShowTimeModel = dbOps.createModel('showtime', showTimeSchema)


module.exports = ShowTimeModel