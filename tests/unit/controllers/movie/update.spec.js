const MovieModel = require('../../../../models/movieModel');
const ApiError = require('../../../../utils/ApiError');
const dbOps = require('../../../../utils/DatabaseOperations');
const {
    resizeImage,
    createMovie,
    deleteMovie,
    viewMovies,
    viewMovie,
    updateMovie,
    viewMoviesPublic,
    viewMoviePublic
} = require('../../../../controllers/movieController');

jest.mock('../../../../models/movieModel', () => jest.fn());
jest.mock('../../../../utils/DatabaseOperations');
jest.mock('../../../../utils/ApiError');

describe('Movie Controller Update', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: { cinemaId: 'cinemaId123' },
            file: { buffer: Buffer.from('test image') },
            body: {},
            resource: { id: 'movieId123', name: 'Test Movie' },
            query: {},
            params: { id: 'movieId123' },

        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();
        jest.clearAllMocks();
    });



    describe('updateMovie', () => {
        it('should update a movie successfully', async () => {
            dbOps.update.mockResolvedValue({ data: { _id: 'movieId123', name: 'Updated Movie' } });

            await updateMovie(req, res, next);

            expect(dbOps.update).toHaveBeenCalledWith(MovieModel, { _id: req.resource.id }, req.body, { new: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: { _id: 'movieId123', name: 'Updated Movie' } });
        });

        it('should handle errors when updating a movie', async () => {
            dbOps.update.mockResolvedValue({ error: 'Error Updating Movie' });

            await updateMovie(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        });
    });


});
