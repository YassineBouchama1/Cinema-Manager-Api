const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../../../utils/ApiError');
const UserService = require('../services/user.service');





/**
 * @swagger
 * /api/v1/user/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Not allowed to delete this user
 */
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





/**
 * @swagger
 * /api/v1/user/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin, super]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
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
        // Ensure req.user._id is available and valid
        const userId = req.user._id; // Assuming req.user is populated by your authentication middleware

        // Pass userId and req.body to the UserService method
        const userUpdated = await UserService.updateMyProfile(userId, req.body);
        
        // Respond with the updated user data
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

    const { search } = req.query;
    const conditions = { role: "user", isDeleted: false };

    // Filter by movie name if provided
    if (search) {
        conditions.name = { $regex: search, $options: 'i' };
    }

    try {
        const users = await UserService.viewUsers(conditions);
        res.status(200).json({ data: users });
    } catch (error) {
        return next(error);
    }
});


// @desc    Update subscription for the logged-in user
// @route   POST /api/v1/users/subscribe
// @access  Private
exports.updateSubscription = expressAsyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const subscriptionDuration = 30; // 30 days subscribs

    try {
        const updatedUser = await UserService.updateUserSubscription(userId, subscriptionDuration);
        res.status(200).json({ message: 'Subscription updated successfully', data: updatedUser });
    } catch (error) {
        return next(error);
    }
});