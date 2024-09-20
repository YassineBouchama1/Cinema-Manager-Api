const mongoose = require('mongoose');
const NodeDaoMongodb = require('../service/node-dao-mongodb');


const nodeDaoMongodb = NodeDaoMongodb.getInstance();



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



const RefreshToken = nodeDaoMongodb.createModel('refreshToken', refreshTokenSchema)


module.exports = RefreshToken
