const mongoose = require('mongoose');
const dbOps = require('../utils/DatabaseOperations');





const cinemaSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Cinema name is required"],
        unique: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    cinemaId: {
        type: mongoose.Schema.ObjectId,
        ref: 'cinema',
    },
}, { timestamps: true });



const CinemaModel = dbOps.createModel('cinema', cinemaSchema)


module.exports = CinemaModel
