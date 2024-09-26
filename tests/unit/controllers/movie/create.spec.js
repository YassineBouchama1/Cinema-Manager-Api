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

describe('Movie Controller Create', () => {
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

    describe('resizeImage', () => {
        it('should resize and save the image successfully', async () => {
            req.body.image = 'test path'
            await resizeImage(req, res, next);
            expect(req.body.image).toBeDefined();
            expect(next).toHaveBeenCalled();
        });
    });

    describe('createMovie', () => {
        it('should create a movie successfully', async () => {
            dbOps.insert.mockResolvedValue({
                data: { _id: 'movieId123', name: 'Test Movie' },
                message: 'Movie created successfully'
            });

            await createMovie(req, res, next);

            expect(dbOps.insert).toHaveBeenCalledWith(MovieModel, { ...req.body, cinemaId: req.user.cinemaId });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ data: { _id: 'movieId123', name: 'Test Movie' }, message: 'Movie created successfully' });
        });

        it('should handle errors when creating a movie', async () => {
            dbOps.insert.mockResolvedValue({ error: 'Error Creating Movie' });

            await createMovie(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        });
    });

});
