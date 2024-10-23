const bcrypt = require('bcryptjs');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const { createToken } = require('../../utils/createToken');

class AuthService {
    async register(userData) {
        const { name, email, password } = userData;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        try {
            const savedUser = await newUser.save();
            return savedUser;
        } catch (error) {
            throw new ApiError(`Error Creating Account: ${error.message}`, 500);
        }
    }

    async login(credentials) {
        const { email, password } = credentials;

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new ApiError(`Email or password incorrect`, 401);
        }

        if (user.isDeleted) {
            throw new ApiError(`This Account Deleted Contact Admin`, 500);
        }

        const token = createToken({ userId: user.id });
        return { user, token };
    }

    async resetPassword(userId, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        try {
            const updatedUser = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
            if (!updatedUser) {
                throw new ApiError(`User not found`, 404);
            }
            return 'Password Updated';
        } catch (error) {
            throw new ApiError(`Error updating password: ${error.message}`, 500);
        }
    }

    async forgetPassword(email) {
        const user = await User.findOne({ email });
        if (!user) {
            return { message: 'If this account exists, an email will be sent' };
        }
        return user;
    }
}

module.exports = new AuthService();