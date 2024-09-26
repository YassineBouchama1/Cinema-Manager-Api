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

describe('Movie Controller View', () => {
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


    describe('viewMovies', () => {
        it('should fetch all movies for a cinema successfully', async () => {
            dbOps.select.mockResolvedValue({ data: [] });

            await viewMovies(req, res, next);

            expect(dbOps.select).toHaveBeenCalledWith(MovieModel, { cinemaId: req.user.cinemaId });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: [] });
        });

        it('should handle errors when fetching movies', async () => {
            dbOps.select.mockResolvedValue({ error: 'Error Fetching Movies' });

            await viewMovies(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        });
    });

    describe('viewMovie', () => {



        it('should fetch a single movie successfully', async () => {
            req.resource = { id: 'movieId123', name: 'Test Movie' };
            await viewMovie(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: req.resource });
        });

        // it('should handle errors when fetching a movie', async () => {
        //     const errorMessage = 'Error Fetching Movie';
        //     await viewMovie(req, res, next);

        //     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        // });
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

    describe('viewMoviesPublic', () => {
        it('should fetch all public movies successfully', async () => {
            dbOps.select.mockResolvedValue({ data: [] });

            await viewMoviesPublic(req, res, next);

            expect(dbOps.select).toHaveBeenCalledWith(MovieModel, {});
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: [] });
        });


        // it('should handle errors when fetching public movies', async () => {

        //     dbOps.select.mockResolvedValue({ error: 'Error Fetching Public Movies' });

        //     await viewMoviesPublic(req, res, next);

        //     expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        // });
    });

    describe('viewMoviePublic', () => {

        // req.params.id = 'movieId123' // assum id comes from params
        it('should fetch a single public movie successfully', async () => {
            const movieData = { data: { _id: 'movieId123', name: 'Public Movie' } };
            dbOps.findOne.mockResolvedValue(movieData);

            await viewMoviePublic(req, res, next);

            expect(dbOps.findOne).toHaveBeenCalledWith(MovieModel, { _id: req.resource.id });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: movieData.data });
        });

        it('should handle errors when fetching a single public movie', async () => {
            dbOps.findOne.mockResolvedValue(null); // simulate not found
            await viewMoviePublic(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        });
    });
});
