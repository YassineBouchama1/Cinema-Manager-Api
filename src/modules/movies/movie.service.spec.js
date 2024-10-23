const MovieService = require('./movie.service');
const ApiError = require('../../utils/ApiError');
const movieController = require('./movie.controller');
const mongoose = require('mongoose');

// mock for service 
jest.mock('./movie.service');

describe('Movie Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
      query: {},
      files: {},
      statistics: {
        numberOfMovies: 0,
        save: jest.fn(),
      },
      user: {
        _id: new mongoose.Types.ObjectId(),
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('uploadMedia', () => {
    it('should upload media successfully', async () => {
      const mediaData = {
        image: 'image-url',
        video: 'video-url',
      };

      MovieService.uploadMedia.mockResolvedValue(mediaData);

      await movieController.uploadMedia(mockReq, mockRes, mockNext);

      expect(mockReq.body.image).toBe(mediaData.image);
      expect(mockReq.body.video).toBe(mediaData.video);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      const error = new Error('Upload failed');
      MovieService.uploadMedia.mockRejectedValue(error);

      await movieController.uploadMedia(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createMovie', () => {
    it('should create a movie successfully', async () => {
      const movieData = {
        title: 'Test Movie',
        description: 'Test Description',
      };

      MovieService.createMovie.mockResolvedValue(movieData);
      mockReq.body = movieData;

      await movieController.createMovie(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: movieData,
        message: 'Movie created successfully',
      });
      expect(mockReq.statistics.numberOfMovies).toBe(1);
      expect(mockReq.statistics.save).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      MovieService.createMovie.mockRejectedValue(error);

      await movieController.createMovie(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ApiError)
      );
    });
  });

  describe('viewMovie', () => {
    it('should return movie with stream status and user rating', async () => {
      const movieId = new mongoose.Types.ObjectId();
      const movieData = {
        movie: {
          _id: movieId,
          title: 'Test Movie',
          video: 'video-url',
          toObject: () => ({
            _id: movieId,
            title: 'Test Movie',
            video: 'video-url',
          }),
        },
        userRating: 4,
      };

      MovieService.viewMovie.mockResolvedValue(movieData);
      mockReq.params.id = movieId;

      await movieController.viewMovie(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Movie',
          hasStream: true,
          userRating: 4,
        })
      );
    });

    it('should handle view errors', async () => {
      const error = new Error('View failed');
      MovieService.viewMovie.mockRejectedValue(error);

      await movieController.viewMovie(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ApiError)
      );
    });
  });

  describe('deleteMovie', () => {
    it('should delete movie successfully', async () => {
      const result = { message: 'Movie deleted successfully' };
      MovieService.deleteMovie.mockResolvedValue(result);

      await movieController.deleteMovie(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(result);
      expect(mockReq.statistics.numberOfMovies).toBe(-1);
      expect(mockReq.statistics.save).toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Deletion failed');
      MovieService.deleteMovie.mockRejectedValue(error);

      await movieController.deleteMovie(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ApiError)
      );
    });
  });

  describe('updateMovie', () => {
    it('should update movie successfully', async () => {
      const updateData = {
        title: 'Updated Movie',
      };
      const updatedMovie = { ...updateData, _id: new mongoose.Types.ObjectId() };

      MovieService.updateMovie.mockResolvedValue(updatedMovie);
      mockReq.body = updateData;
      mockReq.files = { image: null, video: null };

      await movieController.updateMovie(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedMovie);
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      MovieService.updateMovie.mockRejectedValue(error);
      mockReq.files = { image: null, video: null };

      await movieController.updateMovie(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ApiError)
      );
    });
  });

  describe('viewMovies', () => {
    it('should return filtered movies list', async () => {
      const movies = [
        { title: 'Movie 1' },
        { title: 'Movie 2' },
      ];

      MovieService.viewMovies.mockResolvedValue(movies);
      mockReq.query = { search: 'Movie', genre: 'Action' };

      await movieController.viewMovies(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: movies });
      expect(MovieService.viewMovies).toHaveBeenCalledWith(
        expect.objectContaining({
          isDeleted: false,
          name: expect.any(Object),
          genre: 'Action',
        }),
        expect.any(String)
      );
    });

    it('should handle view errors', async () => {
      const error = new Error('View failed');
      MovieService.viewMovies.mockRejectedValue(error);

      await movieController.viewMovies(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ApiError)
      );
    });
  });

  describe('streamMovie', () => {
    it('should set up video streaming proxy', async () => {
      const videoUrl = 'http://video-storage/movie.mp4';
      MovieService.getVideoUrl.mockResolvedValue(videoUrl);
      mockReq.params.id = 'movie-id';

      await movieController.streamMovie(mockReq, mockRes, mockNext);

      expect(MovieService.getVideoUrl).toHaveBeenCalledWith('movie-id');
      // Note: We can't directly test the proxy middleware setup,
      // but we can verify the service was called correctly
    });

    it('should handle streaming errors', async () => {
      const error = new Error('Streaming failed');
      MovieService.getVideoUrl.mockRejectedValue(error);

      await movieController.streamMovie(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ApiError)
      );
    });
  });
});