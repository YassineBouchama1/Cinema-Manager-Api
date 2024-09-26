const dbOps = require('../../../../utils/DatabaseOperations');
const tokenService = require('../../../../utils/createToken');
const { login } = require('../../../../controllers/authController');

const bcrypt = require('bcryptjs');


jest.mock('../../../../models/userModel', () => jest.fn())
jest.mock('../../../../models/cinemaModel', () => jest.fn())
jest.mock('../../../../utils/DatabaseOperations');
jest.mock('bcryptjs');



jest.mock('../../../../utils/createToken', () => ({
    createToken: jest.fn()
}));

describe('Login Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'password123'
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should log in a user successfully', async () => {

        const user = {
            _id: 'someUserId',
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashedPassword123',
            isDeleted: false
        };
        dbOps.findOne.mockResolvedValue({ data: user });

        bcrypt.compare.mockResolvedValue(true);

        const token = 'fakeToken';
        tokenService.createToken.mockReturnValue(token);


        await login(req, res, next);


        expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, user.password);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: user, token });
    });
});
