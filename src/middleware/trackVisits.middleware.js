const Statistic = require("../modules/statistics/statistics.model");

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







const visitorSet = new Set();

const trackVisits = async (req, res, next) => {
    const visitorIP = req.ip;

    try {
        // check if the statistics exist
        let stats = await Statistic.findOne();
        if (!stats) {
            // if no statistics exists, i wil create one
            stats = new Statistic();
            await stats.save();
        }

        // here track unique visits
        if (!visitorSet.has(visitorIP)) {
            visitorSet.add(visitorIP);

            // increment the number of visits directly
            await Statistic.findOneAndUpdate({}, { $inc: { numberOfVisits: 1 } });
        }

        // send statistics through request
        req.statistics = stats;
        next();
    } catch (error) {
        next();
        console.error(`Error tracking visits: ${error.message}`)
    }
};

module.exports = { trackTimeSpent, trackVisits };