const Statistic = require("../models/statistics.model");

// @desc    Get statistics
// @route   GET /api/v1/statistics
// @access  Private
exports.getStatistics = async (req, res, next) => {
    try {
        const stats = await Statistic.findOne({});
        res.status(200).json({ data: stats });
    } catch (error) {
        return next(new ApiError(`Error fetching statistics: ${error.message}`, 500));
    }
};