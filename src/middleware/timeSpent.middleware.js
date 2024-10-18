const Statistic = require("../modules/statistics/models/statistics.model");

const trackTimeSpent = async (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', async () => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000); 
        await Statistic.findOneAndUpdate(
            {}, 
            { $inc: { timeSpent } },
            { upsert: true } 
        );
    });

    next();
};

module.exports = trackTimeSpent;