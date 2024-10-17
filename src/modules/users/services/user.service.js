const User = require('../models/user.model');
const ApiError = require('../../../utils/ApiError');

class UserService {
    async deleteUser(id, currentUser) {
        const user = await User.findById(id);
        if (!user) {
            throw new ApiError(`There is no user belonging to this ID`, 404);
        }

        // check if the user belongs to the same cinema or if the current user is a super admin
        if (user.cinemaId !== currentUser.cinemaId && currentUser.role !== 'super') {
            throw new ApiError('You are not allowed to remove a user from another cinema', 403);
        }

        // change user status
        user.isDeleted = true;
        await user.save();
        return { message: "User Deleted Changed" };
    }

    async updateUser(id, updateData) {
        const user = await User.findById(id);
        if (!user) {
            throw new ApiError(`User not found`, 404);
        }

        Object.assign(user, updateData);
        await user.save();
        return { message: "User Updated Changed" };
    }

    async updateMyProfile(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(`User not found`, 404);
        }

        Object.assign(user, updateData);
        await user.save();
        return user;
    }

    async viewUser(id) {
        const user = await User.findById(id);
        if (!user) {
            throw new ApiError(`No User found with this ID`, 404);
        }
        return user;
    }

    async viewUsers(conditions) {

        console.log(conditions)
        const users = await User.aggregate([
            {
                $match: conditions
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'comments'
                }
            },
            {
                $addFields: {
                    commentCount: { $size: '$comments' }
                }
            },
            {
                $project: {
                    comments: 0
                }
            }
        ]);

        return users;
    }


    async updateUserSubscription(userId, subscriptionDuration) {
        const subscriptionEndDate = new Date(Date.now() + subscriptionDuration * 24 * 60 * 60 * 1000);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                isSubscribe: true,
                subscriptionEndDate,
            },
            { new: true }
        );

        return updatedUser;
    }


}

module.exports = new UserService();