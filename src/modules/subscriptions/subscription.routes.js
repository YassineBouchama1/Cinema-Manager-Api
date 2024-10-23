const express = require('express');
const { protect } = require('../../middleware/auth.middleware');
const { getSubscriptionPlans, createCheckoutSession, handleWebhook, checkSubscriptionStatus } = require('./subscription.controller');

const router = express.Router();

router.route('/plans').get(getSubscriptionPlans);
router.route('/checkout').post(protect, createCheckoutSession);
router.route('/webhook').post(handleWebhook);

module.exports = router;
