const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
const expressAsyncHandler = require('express-async-handler');
    


const subscriptionPlans = [
    { id: 'basic', name: 'Basic Plan', price: 120 },
    { id: 'premium', name: 'Premium Plan', price: 6592 },
    { id: 'deluxe', name: 'Deluxe Plan', price: 7191 },
];

// @desc    Get subscription plans
// @route   GET /api/v1/subscription/plans
// @access  Public
exports.getSubscriptionPlans = (req, res) => {
    res.status(200).json({ data: subscriptionPlans });
};




// @desc    Create a subscription
// @route   POST /api/v1/subscription
// @access  Private
exports.createSubscription = expressAsyncHandler(async (req, res, next) => {
    const { paymentMethodId, planId } = req.body;
    const userId = req.user._id;

    // Find the selected plan
    const selectedPlan = subscriptionPlans.find(plan => plan.id === planId);

    if (!selectedPlan) {
        return next(new ApiError('Invalid subscription plan', 400));
    }

    try {
        // Create a customer if not already created
        const customer = await stripe.customers.create({
            email: req.user.email,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Create a subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: selectedPlan.price }],
            expand: ['latest_invoice.payment_intent'],
        });

        // Update user subscription status in your database
        await User.findByIdAndUpdate(userId, {
            isSubscribe: true,
            subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        res.status(201).json({ message: 'Subscription created successfully', subscription });
    } catch (error) {
        return next(new ApiError(`Error creating subscription: ${error.message}`, 500));
    }
});