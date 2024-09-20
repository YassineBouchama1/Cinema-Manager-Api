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
        enum: ['user', 'admin'],
        default: 'user'
    },
}, { timestamps: true })


const UserModel = nodeDaoMongodb.createModel('Users', userSchema);

module.exports = UserModel





