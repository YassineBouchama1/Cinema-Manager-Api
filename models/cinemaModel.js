const mongoose = require('mongoose');
const NodeDaoMongodb = require('../service/node-dao-mongodb');


const nodeDaoMongodb = NodeDaoMongodb.getInstance();



const cinemaSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "name is required"],
        uniqe: true,
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



const CinemaModel = nodeDaoMongodb.createModel('cinema', cinemaSchema)


module.exports = CinemaModel
