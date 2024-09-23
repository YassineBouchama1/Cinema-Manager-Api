const mongoose = require('mongoose')
const NodeDaoMongodb = require('../service/node-dao-mongodb')

const nodeDaoMongodb = NodeDaoMongodb.getInstance()

const showTimeSchema = mongoose.Schema({

    price: {
        type: Number,
        required: [true, 'price is Required']
    },
    movieId: {
        type: mongoose.Schema.ObjectId,
        ref: 'movie',
        required: [true, 'Movie id is Required']

    },
    cinemaId: {
        type: mongoose.Schema.ObjectId,
        ref: 'cinema',
        required: [true, 'Cienma id is Required']

    },
    roomId: {
        type: mongoose.Schema.ObjectId,
        ref: 'room',
        required: [true, 'Room id is Required']

    },
    startAt: {
        type: Date,
        required: [true, 'Start time is required'],
    },
    endAt: {
        type: Date,
    },
}, { timestamps: true })


// // before save hook to set endAt based on movie duration + 10min
// showTimeSchema.pre('save', async function (next) {
//     try {
//         const movie = await mongoose.model('movie').findById(this.movieId);
//         if (movie && movie.duration) {



//             const durationInMillis = movie.duration * 60 * 1000; // convert to milliseconds
//             const additionalTime = 10 * 60 * 1000 // add 10min 
//             this.endAt = new Date(this.startAt.getTime() + durationInMillis, additionalTime);
//         }
//         next();
//     } catch (error) {
//         next(error);
//     }
// });


const ShowTimeModel = nodeDaoMongodb.createModel('showtime', showTimeSchema)


module.exports = ShowTimeModel