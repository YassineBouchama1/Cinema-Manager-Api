const mongoose = require('mongoose');





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
    isSubscribe: {
        type: Boolean,
        default: false
    },
    subscriptionEndDate: {
        type: Date,
        // only required if subscribed
        required: function () { return this.isSubscribe; }
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


const User = mongoose.model('user', userSchema);

module.exports = User





