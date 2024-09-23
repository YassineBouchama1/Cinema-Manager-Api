const mongoose = require('mongoose');
const NodeDaoMongodb = require('../service/node-dao-mongodb');


const nodeDaoMongodb = NodeDaoMongodb.getInstance();

const romeSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, 'name room is required'],
        minlegth: [5, 'name room is too short']
    },
    capacity: {
        type: Number,
        required: [true, 'capacity room is required'],
    },
    type: {
        type: String,
        required: [true, 'type room is required'],

    }
})


const RomeModel = nodeDaoMongodb.createModel('rome', romeSchema)

module.exports = RomeModel





