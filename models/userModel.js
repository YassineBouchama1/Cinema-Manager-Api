const mongoose = require('mongoose')


const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, "hello@hello.com required"],
        lowercase: true,
        trim: true,

    },
    email: {
        type: String,
        required: [true, 'email required'],
        lowercase: true,
        uniqe: true,
    },
    password: {
        type: String,
        required: [true, "passowrd requierd"],
        minlegth: [6, 'to short password'],

    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
}, { timestamps: true })


const userModel = mongoose.model('Users', userSchema)

module.exports = userModel