const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../../../utils/ApiError');
const AuthService = require('../services/auth.service');

// @desc    Register a new user
// @route   PUT /api/v1/auth/register
// @access  public
exports.register = expressAsyncHandler(async (req, res, next) => {
    try {
        const userData = await AuthService.register(req.body);
        res.status(201).json({ data: userData, message: 'Created Account Successfully' });
    } catch (error) {
        return next(error);
    }
});

// @desc    Login user
// @route   PUT /api/v1/auth/login
// @access  public
exports.login = expressAsyncHandler(async (req, res, next) => {
    try {
        const { user, token } = await AuthService.login(req.body);
        res.status(200).json({ data: user, token });
    } catch (error) {
        return next(error);
    }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset
// @access  public
exports.resetPassword = expressAsyncHandler(async (req, res, next) => {
    try {
        const message = await AuthService.resetPassword(req.user._id, req.body.password);
        res.status(200).json({ message });
    } catch (error) {
        return next(error);
    }
});

// @desc    Forget password
// @route   PUT /api/v1/auth/forget
// @access  public
exports.forgetPassword = expressAsyncHandler(async (req, res, next) => {
    try {
        const user = await AuthService.forgetPassword(req.body.email);
        res.status(200).json(user);
    } catch (error) {
        return next(error);
    }
});