const mongoose = require('mongoose');




const roomSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, 'name room is required'],
        minlegth: [1, 'name room is too short']
    },
    capacity: {
        type: Number,
        required: [true, 'capacity room is required'],
    },
    seatsPerRow: {
        type: Number,
        required: [true, 'Number of seats per row is required'],
        default: 10
    },
    type: {
        type: String,
        required: [true, 'type room is required'],
    },

    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


const Room = mongoose.model('room', roomSchema)

module.exports = Room





