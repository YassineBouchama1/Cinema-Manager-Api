const mongoose = require('mongoose');
const NodeDaoMongodb = require('../service/node-dao-mongodb');


const nodeDaoMongodb = NodeDaoMongodb.getInstance();


const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, "name is required"],

    },
    email: {
        type: String,
        required: [true, 'email  is required'],
        lowercase: true,
        uniqe: true,
    },
    password: {
        type: String,
        required: [true, "passowrd is requierd"],
        minlegth: [6, 'to short password'],

    },

    role: {
        type: String,
        enum: ['user', 'admin', 'super'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true

    },
    cinemaId: {
        type: mongoose.Schema.ObjectId,
        ref: 'cinema',
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


const UserModel = nodeDaoMongodb.createModel('user', userSchema);

module.exports = UserModel





