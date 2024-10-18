const bcrypt = require('bcryptjs');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const { createToken } = require('../../utils/createToken');
const AuthService = require('./auth.service');

// Mocking external dependencies
jest.mock('bcryptjs');
jest.mock('../users/user.model');
jest.mock('../../utils/createToken');

describe('AuthService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
            const hashedPassword = 'hashedPassword123';

            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue(hashedPassword);
            User.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue({ ...userData, password: hashedPassword, role: 'user' })
            }));

            const result = await AuthService.register(userData);

            expect(result).toEqual({ ...userData, password: hashedPassword, role: 'user' });
            expect(User).toHaveBeenCalledWith({ ...userData, password: hashedPassword, role: 'user' });
        });

        it('should throw an ApiError if user creation fails', async () => {
            const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };

            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword123');
            User.mockImplementation(() => ({
                save: jest.fn().mockRejectedValue(new Error('Database error'))
            }));

            await expect(AuthService.register(userData)).rejects.toThrow(ApiError);
        });
    });

    describe('login', () => {
        it('should login a user successfully', async () => {
            const credentials = { email: 'test@example.com', password: 'password123' };
            const user = { id: 'userId123', ...credentials, password: 'hashedPassword123' };

            User.findOne.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(true);
            createToken.mockReturnValue('token123');

            const result = await AuthService.login(credentials);

            expect(result).toEqual({ user, token: 'token123' });
            expect(createToken).toHaveBeenCalledWith({ userId: user.id });
        });

        it('should throw an ApiError if email or password is incorrect', async () => {
            const credentials = { email: 'test@example.com', password: 'wrongpassword' };

            User.findOne.mockResolvedValue(null);

            await expect(AuthService.login(credentials)).rejects.toThrow(ApiError);
        });

        it('should throw an ApiError if account is deleted', async () => {
            const credentials = { email: 'test@example.com', password: 'password123' };
            const user = { ...credentials, password: 'hashedPassword123', isDeleted: true };

            User.findOne.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(true);

            await expect(AuthService.login(credentials)).rejects.toThrow(ApiError);
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully', async () => {
            const userId = 'userId123';
            const newPassword = 'newPassword123';
            const hashedPassword = 'newHashedPassword123';

            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue(hashedPassword);
            User.findByIdAndUpdate.mockResolvedValue({ id: userId, password: hashedPassword });

            const result = await AuthService.resetPassword(userId, newPassword);

            expect(result).toBe('Password Updated');
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, { password: hashedPassword }, { new: true });
        });

        it('should throw an ApiError if user is not found', async () => {
            const userId = 'nonexistentUserId';
            const newPassword = 'newPassword123';

            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('newHashedPassword123');
            User.findByIdAndUpdate.mockResolvedValue(null);

            await expect(AuthService.resetPassword(userId, newPassword)).rejects.toThrow(ApiError);
        });
    });

    describe('forgetPassword', () => {
        it('should return user if email exists', async () => {
            const email = 'test@example.com';
            const user = { email, id: 'userId123' };

            User.findOne.mockResolvedValue(user);

            const result = await AuthService.forgetPassword(email);

            expect(result).toEqual(user);
        });

        it('should return a generic message if email does not exist', async () => {
            const email = 'nonexistent@example.com';

            User.findOne.mockResolvedValue(null);

            const result = await AuthService.forgetPassword(email);

            expect(result).toEqual({ message: 'If this account exists, an email will be sent' });
        });
    });
});