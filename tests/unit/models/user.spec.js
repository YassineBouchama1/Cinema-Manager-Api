const UserModel = require('../../../models/userModel');

describe('User Model Tests', () => {
    it('should create a new user successfully', async () => {
        const userData = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'user'
        };

        const user = new UserModel(userData);
        const savedUser = await user.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.email).toBe(userData.email);
    });

    // it('should throw a validation error if required fields are missing', async () => {
    //     const userData = {
    //         email: 'john@example.com',
    //     };

    //     const user = new UserModel(userData);

    //     await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    // });
});
