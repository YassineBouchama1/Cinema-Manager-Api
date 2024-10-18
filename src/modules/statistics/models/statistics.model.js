const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
    numberOfCustomers: { type: Number, default: 0 },
    numberOfMovies: { type: Number, default: 0 },
    numberOfVisits: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
}, { timestamps: true });

const Statistic = mongoose.model('Statistic', statisticsSchema);

module.exports = Statistic