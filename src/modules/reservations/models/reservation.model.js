
const mongoose = require('mongoose');
const dbOps = require('../../../utils/DatabaseOperations');



const reservationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: [true, 'User ID is required']
    },
    showTimeId: {
        type: mongoose.Schema.ObjectId,
        ref: 'showtime',
        required: [true, 'Showtime ID is required']
    },
    seats: {
        type: [Number], // array of seats
        required: [true, 'Seats are required']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required']
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'cancel'],
        default: 'active'
    }
}, { timestamps: true });

const Reservation = dbOps.createModel('reservation', reservationSchema);

module.exports = Reservation;
