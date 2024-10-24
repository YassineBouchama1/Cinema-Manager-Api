const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../../utils/ApiError');
const User = require('../users/user.model');

const subscriptionPlans = [
    {
        id: 'basic',
        name: '1 Month',
        priceId: 'price_1QD1d0KY6q86Wg4m1ZDvlnov',
        durationInDays: 30
    },
    {
        id: 'premium',
        name: '6 Months',
        priceId: 'price_1QD1dTKY6q86Wg4mJgCricTb',
        durationInDays: 180
    },
    {
        id: 'deluxe',
        name: '1 Year',
        priceId: 'price_1QD1e3KY6q86Wg4mb65Ez1gy',
        durationInDays: 365
    },
];

// @desc    Get subscription plans
// @route   GET /api/v1/subscription/plans
// @access  Public
exports.getSubscriptionPlans = (req, res) => {
    res.status(200).json({ data: subscriptionPlans });
};




// @desc    Create a subscription via Stripe Checkout
// @route   POST /api/v1/subscription/checkout
// @access  Private
exports.createCheckoutSession = expressAsyncHandler(async (req, res, next) => {
    const { planId } = req.body;
    const userId = req.user._id;
    console.log(planId)
    // find the selected plan
    const selectedPlan = subscriptionPlans.find(plan => plan.id === planId);

    if (!selectedPlan) {
        return next(new ApiError('Invalid subscription plan', 400));
    }

    try {
        // Create metadata to store plan details
        const metadata = {
            userId: userId.toString(),
            planId: selectedPlan.id,
            durationInDays: selectedPlan.durationInDays.toString()
        };


        console.log(process.env.NEXT_PUBLIC_FRONT_URL)
        // Create a Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],

            line_items: [
                {
                    price: selectedPlan.priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_FRONT_URL}/profile?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_FRONT_URL}/cancel`,
            metadata: metadata,
        });


        res.status(200).json({ id: session.id });
    } catch (error) {
        return next(new ApiError(`Error creating checkout session: ${error.message}`, 500));
    }
});



// @desc    Handle successful payment webhook
// @route   POST /api/v1/subscription/webhook
// @access  Private (Stripe webhook)
exports.handleWebhook = expressAsyncHandler(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;

    const sessionId = req.params.sessionId;
    try {
        event = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
        return next(new ApiError(`Webhook Error: ${err.message}`, 400));
    }

    // Check if the session is open
    if (event?.status === "open") {
        return next(new ApiError(`Payment still open, not finished: ${event.status}`, 400));
    }

    // Handle the checkout.status event
    if (event?.status === "complete") {
        const session = event.data.object;

        // Get the metadata from the session
        const { userId, durationInDays } = session.metadata;

        // Calculate subscription end date
        const subscriptionEndDate = new Date(
            Date.now() + parseInt(durationInDays) * 24 * 60 * 60 * 1000
        );

        try {
            // Update user subscription status
            const userUpdated = await User.findByIdAndUpdate(userId, {
                isSubscribe: true,
                subscriptionEndDate,
            });

            console.log(userUpdated)
        } catch (error) {
            return next(new ApiError(`Error updating user subscription: ${error.message}`, 500));
        }
    } else {
        return res.status(400).json({ error: 'Payment not completed' });
    }

    res.status(200).json({ received: true });
});



// @desc    Check subscription status
// @route   GET /api/v1/subscription/status
// @access  Private
exports.checkSubscriptionStatus = expressAsyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return next(new ApiError('User not found', 404));
        }

        const now = new Date();
        const isActive = user.isSubscribe && user.subscriptionEndDate > now;

        res.status(200).json({
            isActive,
            subscriptionEndDate: user.subscriptionEndDate,
            daysRemaining: isActive ?
                Math.ceil((user.subscriptionEndDate - now) / (1000 * 60 * 60 * 24)) :
                0
        });
    } catch (error) {
        return next(new ApiError(`Error checking subscription status: ${error.message}`, 500));
    }
});