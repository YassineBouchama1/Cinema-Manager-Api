const mongoose = require('mongoose');
const DatabaseOperations = require('../utils/DatabaseOperations');

const dbOps = DatabaseOperations.getInstance();



const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
    },
    expiryDate: {
        type: Date,
        required: true,
    },
});



const RefreshToken = dbOps.createModel('refreshToken', refreshTokenSchema)


module.exports = RefreshToken
