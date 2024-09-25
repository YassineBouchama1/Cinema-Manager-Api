const { register } = require('../../../controllers/authController');
const UserModel = require('../../../models/userModel.js');
const dbOps = require('../../../utils/DatabaseOperations.js');

jest.mock('../../../models/userModel.js');

describe('Register Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
        // Mocking UserModel.findOne to simulate that the user does not exist
        UserModel.findOne.mockResolvedValueOnce(null);

        // Mocking UserModel.create to simulate user creation
        const mockUserResult = {
            _id: 'someUserId',
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        };
        dbOps.insert.mockResolvedValueOnce({
            message: 'Insert successful',
            insertedId: mockUserResult._id,
            data: mockUserResult
        });

        // Logging to see if register is called
        console.log('Before calling register function');
        await register(req, res, next);
        console.log('After calling register function');

        expect(res.status).toHaveBeenCalledWith(201);

    });
});
