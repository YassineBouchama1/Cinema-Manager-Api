const mongoose = require('mongoose');
const ShowTimeService = require('./showtime.service');
const ShowTime = require('./showtime.model');
const Movie = require('../movies/movie.model');
const Room = require('../rooms/room.model');
const Reservation = require('../reservations/reservation.model');
const ApiError = require('../../utils/ApiError');

// mock all the mongoose models
jest.mock('./showtime.model');
jest.mock('../movies/movie.model');
jest.mock('../rooms/room.model');
jest.mock('../reservations/reservation.model');

describe('ShowTimeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createShowTime', () => {
        const mockMovie = {
            _id: new mongoose.Types.ObjectId(),
            duration: 120, // 2 hours
        };

        const mockRoom = {
            _id: new mongoose.Types.ObjectId(),
            name: 'Room 1',
        };

        const mockShowTimeData = {
            price: 10,
            movieId: mockMovie._id,
            roomId: mockRoom._id,
            startAt: '2024-10-23T18:00:00.000Z',
        };

        it('should create a showtime successfully', async () => {
            const startDate = new Date(mockShowTimeData.startAt);
            const expectedEndDate = new Date(startDate.getTime() + (120 + 10) * 60 * 1000); // movie duration + 10 minutes

            Movie.findById.mockResolvedValue(mockMovie);
            Room.findById.mockResolvedValue(mockRoom);

            const mockSavedShowTime = {
                ...mockShowTimeData,
                _id: new mongoose.Types.ObjectId(),
                endAt: expectedEndDate,
            };

            ShowTime.prototype.save.mockResolvedValue(mockSavedShowTime);

            const result = await ShowTimeService.createShowTime(mockShowTimeData);

            expect(Movie.findById).toHaveBeenCalledWith(mockShowTimeData.movieId);
            expect(Room.findById).toHaveBeenCalledWith(mockShowTimeData.roomId);
            expect(result).toEqual(mockSavedShowTime);
            expect(result.endAt).toEqual(expectedEndDate);
        });

        it('should throw error if movie not found', async () => {
            Movie.findById.mockResolvedValue(null);
            Room.findById.mockResolvedValue(mockRoom);

            await expect(ShowTimeService.createShowTime(mockShowTimeData))
                .rejects
                .toThrow(new ApiError('Movie not found', 404));
        });

        it('should throw error if room not found', async () => {
            Movie.findById.mockResolvedValue(mockMovie);
            Room.findById.mockResolvedValue(null);

            await expect(ShowTimeService.createShowTime(mockShowTimeData))
                .rejects
                .toThrow(new ApiError('Room not found', 404));
        });

        it('should throw error for invalid date format', async () => {
            Movie.findById.mockResolvedValue(mockMovie);
            Room.findById.mockResolvedValue(mockRoom);

            const invalidShowTimeData = {
                ...mockShowTimeData,
                startAt: 'invalid-date',
            };

            await expect(ShowTimeService.createShowTime(invalidShowTimeData))
                .rejects
                .toThrow(new ApiError('Invalid startAt date format', 400));
        });

        it('should throw error for invalid movie duration', async () => {
            const invalidMovie = { ...mockMovie, duration: 'invalid' };
            Movie.findById.mockResolvedValue(invalidMovie);
            Room.findById.mockResolvedValue(mockRoom);

            await expect(ShowTimeService.createShowTime(mockShowTimeData))
                .rejects
                .toThrow(new ApiError('Invalid movie duration', 400));
        });
    });

    describe('updateShowTime', () => {
        const mockShowTimeId = new mongoose.Types.ObjectId();
        const updateData = {
            price: 15,
            startAt: '2024-10-23T20:00:00.000Z',
        };

        it('should update showtime successfully', async () => {
            const mockShowTime = {
                _id: mockShowTimeId,
                ...updateData,
                save: jest.fn(),
            };

            ShowTime.findById.mockResolvedValue(mockShowTime);
            mockShowTime.save.mockResolvedValue({ ...mockShowTime, ...updateData });

            const result = await ShowTimeService.updateShowTime(mockShowTimeId, updateData);

            expect(ShowTime.findById).toHaveBeenCalledWith(mockShowTimeId);
            expect(result).toEqual(expect.objectContaining(updateData));
        });

        it('should throw error if showtime not found', async () => {
            ShowTime.findById.mockResolvedValue(null);

            await expect(ShowTimeService.updateShowTime(mockShowTimeId, updateData))
                .rejects
                .toThrow(new ApiError('Showtime not found', 404));
        });
    });

    describe('deleteShowTime', () => {
        const mockShowTimeId = new mongoose.Types.ObjectId();

        it('should soft delete showtime successfully', async () => {
            const mockUpdatedShowTime = {
                _id: mockShowTimeId,
                isDeleted: true,
            };

            ShowTime.findByIdAndUpdate.mockResolvedValue(mockUpdatedShowTime);

            const result = await ShowTimeService.deleteShowTime(mockShowTimeId);

            expect(ShowTime.findByIdAndUpdate).toHaveBeenCalledWith(
                mockShowTimeId,
                { isDeleted: true },
                { new: true }
            );
            expect(result.isDeleted).toBe(true);
        });

        it('should throw error if showtime not found', async () => {
            ShowTime.findByIdAndUpdate.mockResolvedValue(null);

            await expect(ShowTimeService.deleteShowTime(mockShowTimeId))
                .rejects
                .toThrow(new ApiError('Showtime not found', 404));
        });
    });

    describe('viewShowTimes', () => {
        it('should return all non-deleted showtimes with populated data', async () => {
            const mockShowTimes = [
                {
                    _id: new mongoose.Types.ObjectId(),
                    movieId: {
                        name: 'Test Movie',
                        image: 'image.jpg',
                    },
                    roomId: {
                        name: 'Room 1',
                        capacity: 100,
                    },
                },
            ];

            ShowTime.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockShowTimes),
            });

            const result = await ShowTimeService.viewShowTimes();

            expect(ShowTime.find).toHaveBeenCalledWith({ isDeleted: false });
            expect(result).toEqual(mockShowTimes);
        });
    });

    describe('viewShowTimeWithReservations', () => {
        const mockShowTimeId = new mongoose.Types.ObjectId();

        it('should return showtime with its reservations', async () => {
            const mockShowTime = {
                _id: mockShowTimeId,
                movieId: {
                    name: 'Test Movie',
                    duration: 120,
                    category: 'Action',
                    image: 'image.jpg',
                },
                roomId: {
                    name: 'Room 1',
                    capacity: 100,
                },
            };

            const mockReservations = [
                {
                    _id: new mongoose.Types.ObjectId(),
                    showTimeId: mockShowTimeId,
                },
            ];

            ShowTime.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockShowTime),
            });

            Reservation.find.mockResolvedValue(mockReservations);

            const result = await ShowTimeService.viewShowTimeWithReservations(mockShowTimeId);

            expect(ShowTime.findById).toHaveBeenCalledWith(mockShowTimeId);
            expect(Reservation.find).toHaveBeenCalledWith({ showTimeId: mockShowTimeId });
            expect(result).toEqual({ showTime: mockShowTime, reservations: mockReservations });
        });

        it('should throw error if showtime not found', async () => {
            ShowTime.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(ShowTimeService.viewShowTimeWithReservations(mockShowTimeId))
                .rejects
                .toThrow(new ApiError('Showtime not found', 404));
        });
    });

    describe('viewShowTimesPublic', () => {
        it('should return showtimes based on conditions', async () => {
            const conditions = { startAt: { $gte: new Date() } };
            const mockShowTimes = [
                {
                    _id: new mongoose.Types.ObjectId(),
                    startAt: new Date(),
                },
            ];

            ShowTime.find.mockResolvedValue(mockShowTimes);

            const result = await ShowTimeService.viewShowTimesPublic(conditions);

            expect(ShowTime.find).toHaveBeenCalledWith(conditions);
            expect(result).toEqual(mockShowTimes);
        });
    });

    describe('showTimesBelongMovie', () => {
        const mockMovieId = new mongoose.Types.ObjectId();

        it('should return showtimes for specific movie with populated room data', async () => {
            const mockShowTimes = [
                {
                    _id: new mongoose.Types.ObjectId(),
                    movieId: mockMovieId,
                    roomId: {
                        name: 'Room 1',
                        capacity: 100,
                        seatsPerRow: 10,
                    },
                },
            ];

            ShowTime.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockShowTimes),
            });

            const result = await ShowTimeService.showTimesBelongMovie(mockMovieId);

            expect(ShowTime.find).toHaveBeenCalledWith({ movieId: mockMovieId });
            expect(result).toEqual(mockShowTimes);
        });
    });
});