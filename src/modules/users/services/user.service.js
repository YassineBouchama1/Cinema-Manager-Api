const User = require('../models/user.model');
const ApiError = require('../../../utils/ApiError');
const sharp = require('sharp');
const minioClient = require('../../../config/minioClient.config');
const bcrypt = require('bcryptjs');


class UserService {

    async uploadMediaAvatar(req, res, next) {
        const timestamp = Date.now();
        const randomId = Math.round(Math.random() * 1E9);

        const userName = req.body.name?.replace(/\s+/g, '') || 'avatar';

        // handle image upload
        if (req.files && req.files.image) {
            try {

                const imageFile = req.files.image[0];
                const imageFileName = `users/avatars/${userName}-${timestamp}-${randomId}.png`;

                // Resize and upload image
                const imageBuffer = await sharp(imageFile.buffer).toBuffer();
                await minioClient.putObject('cinema', imageFileName, imageBuffer);
                req.body.avatar = `/cinema/${imageFileName}`; // Set avatar URL in request body
                next(); // Call the next middleware
            } catch (error) {
                console.log(error.message);
                return next(new ApiError(`Error while uploading image: ${error.message}`, 404));
            }
        } else {
            next(); // If no image, just proceed to the next middleware
        }
    }

    async updateMyProfile(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(`User not found`, 404);
        }


        // if user want  update password 
        if (updateData.password && updateData.passwordConfirm) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(updateData.password, salt); // hach the new pass before saved
            updateData.password = hashedPassword
        }



        // Update user data
        Object.assign(user, updateData);
        await user.save();
        return user; // Return the updated user
    }

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