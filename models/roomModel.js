const mongoose = require('mongoose');
const DatabaseOperations = require('../utils/DatabaseOperations');

const dbOps = DatabaseOperations.getInstance();

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
    type: {
        type: String,
        required: [true, 'type room is required'],

    },
    cinemaId: {
        type: mongoose.Schema.ObjectId,
        ref: 'cinema',
        required: [true, 'cinema id is required'],

    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


const roomModel = dbOps.createModel('room', roomSchema)

module.exports = roomModel





