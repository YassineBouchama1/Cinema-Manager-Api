const ShowTimeModel = require('../../../models/showTimeModel');

const ApiError = require('../../../utils/ApiError');
const dbOps = require('../../../utils/DatabaseOperations');
const {
    createShowTime,
    updateShowTime,
    deleteShowTime,
    viewShowTimes
} = require('../../../controllers/showtimeController');
const MovieModel = require('../../../models/movieModel');

jest.mock('../../../models/showTimeModel', () => jest.fn());
jest.mock('../../../models/movieModel', () => ({
    findById: jest.fn(),
}));
jest.mock('../../../utils/DatabaseOperations');
jest.mock('../../../utils/ApiError');

describe('ShowTime Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: { cinemaId: 'cinemaId123' },
            resource: { id: 'showTimeId123' },
            params: { id: 'showTimeId123' },
            body: { movieId: 'movieId123', price: 15, roomId: 'roomId123', startAt: '2024-09-26T12:00:00Z', endAt: '2024-09-26T012:52:04.422Z' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('createShowTime', () => {
        it('should create a showtime successfully', async () => {
            dbOps.findOne.mockResolvedValueOnce({ data: { cinemaId: 'cinemaId123', duration: 120 } });
            dbOps.findOne.mockResolvedValueOnce({ data: { cinemaId: 'cinemaId123' } });
            dbOps.insert.mockResolvedValue({ data: { _id: 'showTimeId123' }, message: 'Showtime created successfully' });

            await createShowTime(req, res, next);



            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                data: { _id: 'showTimeId123' },
                message: 'Showtime created successfully'
            });
        });

        it('should handle errors when creating a showtime', async () => {
            dbOps.findOne.mockResolvedValueOnce({ data: { cinemaId: 'cinemaId123', duration: 120 } });
            dbOps.findOne.mockResolvedValueOnce({ data: { cinemaId: 'cinemaId123' } });
            dbOps.insert.mockResolvedValue({ error: 'Error Creating Showtime' });

            await createShowTime(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        });
    });



    describe('Update Show Time', () => {

        it('should update the showtime successfully', async () => {


            const mockMovie = { duration: 120 };

            MovieModel.findById.mockResolvedValue(mockMovie);
            dbOps.update.mockResolvedValue({ data: { id: "1" } });

            await updateShowTime(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: { id: "1" } });



        });


        it('should return 404 if movie is not found', async () => {
            MovieModel.findById.mockResolvedValue(null);

            await updateShowTime(req, res, next);


            expect(next).toHaveBeenCalled();




        });


    })




    describe('deleteShowTime', () => {
        it('should delete a showtime successfully', async () => {
            req.resource = { id: 'showTimeId123' };
            dbOps.softDelete.mockResolvedValue({ message: 'Showtime deleted successfully' });

            await deleteShowTime(req, res, next);

            expect(dbOps.softDelete).toHaveBeenCalledWith(ShowTimeModel, { _id: req.resource.id });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Showtime deleted successfully' });
        });

        it('should handle errors when deleting a showtime', async () => {
            dbOps.softDelete.mockResolvedValue({ error: 'Error Deleting Showtime' });

            await deleteShowTime(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        });
    });

    describe('viewShowTimes', () => {
        it('should fetch all showtimes for a cinema successfully', async () => {
            dbOps.select.mockResolvedValue({ data: [] });

            await viewShowTimes(req, res, next);

            expect(dbOps.select).toHaveBeenCalledWith(ShowTimeModel, { cinemaId: req.user.cinemaId });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: [] });
        });

        it('should handle errors when fetching showtimes', async () => {
            dbOps.select.mockResolvedValue({ error: 'Error Fetching Showtimes' });

            await viewShowTimes(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        });
    });
});
