const mongoose = require('mongoose')




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


const ShowTime = mongoose.model('showtime', showTimeSchema)


module.exports = ShowTime