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

describe('Movie Controller Delete', () => {
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



    describe('deleteMovie', () => {
        it('should delete a movie successfully', async () => {
            dbOps.softDelete.mockResolvedValue({ message: 'Movie deleted successfully' });

            await deleteMovie(req, res, next);

            expect(dbOps.softDelete).toHaveBeenCalledWith(MovieModel, { _id: req.resource.id });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Movie deleted successfully' });
        });

        it('should handle errors when deleting a movie', async () => {
            dbOps.softDelete.mockResolvedValue({ error: 'Error Deleting Movie' });

            await deleteMovie(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        });
    });


});
