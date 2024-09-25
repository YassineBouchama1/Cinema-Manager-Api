const dbOps = require('../../../utils/DatabaseOperations');
const UserModel = require('../../../models/userModel');
const CinemaModel = require('../../../models/cinemaModel');
const { register } = require('../../../controllers/authController');

const bcrypt = require('bcryptjs');
const ApiError = require('../../../utils/ApiError');


jest.mock('../../../models/userModel', () => jest.fn())
jest.mock('../../../models/cinemaModel', () => jest.fn())
jest.mock('../../../utils/DatabaseOperations');
jest.mock('bcryptjs');

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
        jest.clearAllMocks();
    });

    it('should register a user successfully', async () => {



        // mock bcrypt hash : add virtual values
        bcrypt.genSalt.mockResolvedValue('fakeSalt');
        bcrypt.hash.mockResolvedValue('hashedPassword123');

        // ock dbOps.insert for user creation : add what insert return
        dbOps.insert.mockResolvedValue({
            data: { _id: 'someUserId', name: 'Test User', email: 'test@example.com', role: 'user' }
        });


        // excute controller with new environment mocked like  : dbOps.insert
        await register(req, res, next);



        // mock bcrypt hash : add virtual values
        expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'fakeSalt');



        // Expect dbOps.insert to have been called with UserModel : expect.any(Function) .  and userData 
        expect(dbOps.insert).toHaveBeenCalledWith(expect.any(Function), {
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashedPassword123',
            role: 'user'
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            data: { _id: 'someUserId', name: 'Test User', email: 'test@example.com', role: 'user' },
            message: 'Created Account Successfully'
        });
    });

    
    it('should register an admin with cinema successfully', async () => {
        req.body.role = 'admin';
        req.body.cinemaName = 'Test Cinema';

        // Mock bcrypt hash
        bcrypt.genSalt.mockResolvedValue('fakeSalt');
        bcrypt.hash.mockResolvedValue('hashedPassword123');

        // Mock dbOps.insert for cinema creation and user creation
        dbOps.insert
            .mockResolvedValueOnce({
                data: { _id: 'cinemaId', name: 'Test Cinema' } // First call for cinema
            })
            .mockResolvedValueOnce({
                data: { _id: 'someUserId', name: 'Test Admin', email: 'admin@example.com', role: 'admin', cinemaId: 'cinemaId' }
            });

        await register(req, res, next);

        expect(dbOps.insert).toHaveBeenCalledWith(expect.any(Function), { name: 'Test Cinema' });
        expect(dbOps.insert).toHaveBeenCalledWith(expect.any(Function), {
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashedPassword123',
            role: 'admin',
            cinemaId: 'cinemaId'
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            data: { _id: 'someUserId', name: 'Test Admin', email: 'admin@example.com', role: 'admin', cinemaId: 'cinemaId' },
            message: 'Created Account Successfully'
        });
    });


    it('should throw an error when cinemaName is missing for admin registration', async () => {
        req.body.role = 'admin';
        delete req.body.cinemaName; // remove cinemaName to simulate the error

        await register(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ApiError)); // expect return appError fun
        expect(next.mock.calls[0][0].message).toContain('Cinema');
        expect(next.mock.calls[0][0].statusCode).toBe(400);
    });


    it('should handle dbOps.insert failure for cinema', async () => {
        req.body.role = 'admin';
        req.body.cinemaName = 'Test Cinema';

        // Mock dbOps.insert to fail for cinema creation
        dbOps.insert.mockResolvedValueOnce({ error: 'Cinema creation failed' });

        await register(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        expect(next.mock.calls[0][0].message).toBe('Error Creating Cinema: Cinema creation failed');
        expect(next.mock.calls[0][0].statusCode).toBe(500);
    });


});
