const express = require('express');
const { protect } = require('../../middleware/auth.middleware');
const { getSubscriptionPlans, createSubscription } = require('./subscription.controller');

const router = express.Router();

router.route('/plans').get(getSubscriptionPlans);
router.route('/').post(protect, createSubscription);

module.exports = router;