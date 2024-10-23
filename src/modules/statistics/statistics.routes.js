const express = require('express');
const { getStatistics } = require('./statistics.controller');
const router = express.Router();

router.route('/')
    .get(getStatistics);

module.exports = router;