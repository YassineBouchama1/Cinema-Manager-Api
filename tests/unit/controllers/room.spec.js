const dbOps = require('../../../utils/DatabaseOperations');
const ApiError = require('../../../utils/ApiError');
const { createRoom, deleteRoom, updateRoom } = require('../../../controllers/roomController');

jest.mock('../../../models/roomModel', () => jest.fn());
jest.mock('../../../utils/DatabaseOperations');
jest.mock('../../../utils/ApiError');

describe('Room Controller - createRoom', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: { name: 'Test Room', capacity: 100 },
            user: { cinemaId: 'cinemaId123' }  // assum that user admin has cinemId
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should create a room successfully', async () => {


        // Mock dbOps.insert to return success resylt
        dbOps.insert.mockResolvedValue({
            data: { _id: 'roomId123', name: 'Test Room', capacity: 100, cinemaId: 'cinemaId123' },
            message: 'Room created successfully'
        });

        await createRoom(req, res, next);

        expect(dbOps.insert).toHaveBeenCalledWith(expect.any(Function), {
            ...req.body,
            cinemaId: req.user.cinemaId
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            data: { _id: 'roomId123', name: 'Test Room', capacity: 100, cinemaId: 'cinemaId123' },
            message: 'Room created successfully'
        });
    });






    it('should handle insert error and call next with an ApiError', async () => {

        // Mock dbOps.insert to return ab error result
        dbOps.insert.mockResolvedValue({ error: 'Room creation failed' });

        await createRoom(req, res, next);

        expect(dbOps.insert).toHaveBeenCalledWith(expect.any(Function), {
            ...req.body,
            cinemaId: req.user.cinemaId
        });

        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });


});


describe('Room Controller - deleteRoom', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            resource: { id: 'roomId123' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should delete a room successfully', async () => {


        // mock dbOps.softDelete to return success resylt
        dbOps.softDelete.mockResolvedValue({ message: 'Soft Deleted Successfully' });

        await deleteRoom(req, res, next);

        expect(dbOps.softDelete).toHaveBeenCalledWith(expect.any(Function), { _id: req.resource.id });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Soft Deleted Successfully' });
    });


    it('should handle softDelete error and call next with an ApiError', async () => {

        // moch dbops return error
        dbOps.softDelete.mockResolvedValue({ error: 'Room deletion failed' });

        await deleteRoom(req, res, next);

        expect(dbOps.softDelete).toHaveBeenCalledWith(expect.any(Function), { _id: req.resource.id });

        expect(next).toHaveBeenCalledWith(expect.any(ApiError));

    });


});



describe('Room Controller - Update Room', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            resource: { id: 'roomId123' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should update the room successfully', async () => {


        // Mock dbOps.update to return success result
        dbOps.update = jest.fn().mockResolvedValue({
            data: { _id: 'room123', name: 'Updated Room Name' },
            message: 'Room updated successfully'
        });

        await updateRoom(req, res, next);

        expect(dbOps.update).toHaveBeenCalledWith(
            expect.any(Function),
            { _id: req.resource.id },
            req.body,
            { new: true }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: { _id: 'room123', name: 'Updated Room Name' },
            message: 'Room updated successfully'
        });
    });

    it('should handle errors when the room update fails', async () => {

        dbOps.update.mockResolvedValue({ error: 'Error in updating room' });

        await updateRoom(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        // expect(next.mock.calls[0][0].message).toContain('error while trying to update room');w
    });




});