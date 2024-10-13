const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../../../utils/ApiError');
const UserService = require('../services/user.service');

// @desc    Delete a user
// @route   DELETE /api/v1/user/:id
// @access  Private /user & admin
exports.deleteUser = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await UserService.deleteUser(id, req.user);
        res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
});




// @desc    Update a user
// @route   PUT /api/v1/user/:id
// @access  Private admin
exports.updateUser = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await UserService.updateUser(id, req.body);
        res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
});

// @desc    Update profile user with all roles with token
// @route   PUT /api/v1/user/me
// @access  Private /user & admin
exports.updateMyProfile = expressAsyncHandler(async (req, res, next) => {
    try {

        const userUpdated = await UserService.updateMyProfile(req.user._id, req.body);
        res.status(200).json(userUpdated);
    } catch (error) {
        return next(error);
    }
});




// @desc    Get a single user by ID
// @route   GET /api/v1/user/:id
// @access  public
exports.viewUser = expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const user = await UserService.viewUser(id);
        res.status(200).json({ data: user });
    } catch (error) {
        return next(error);
    }
});

// @desc    Get profile info of authenticated user
// @route   GET /api/v1/user/me
// @access  private
exports.myProfile = expressAsyncHandler(async (req, res, next) => {
    try {
        res.status(200).json({ data: req.user });
    } catch (error) {
        return next(error);
    }
});

// @desc    View all users 
// @route   GET /api/v1/users
// @access  Private : super admin
exports.viewUsers = expressAsyncHandler(async (req, res, next) => {
    try {
        const users = await UserService.viewUsers();
        res.status(200).json({ data: users });
    } catch (error) {
        return next(error);
    }
});