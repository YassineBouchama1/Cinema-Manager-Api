const mongoose = require('mongoose');
const ReservationService = require('./reservation.service');
const Reservation = require('./reservation.model');
const ShowTime = require('../showtimes/showtime.model');
const ApiError = require('../../utils/ApiError');

// Mock the mongoose models
jest.mock('./reservation.model');
jest.mock('../showtimes/showtime.model');

describe('ReservationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createReservation', () => {
        const mockShowTime = {
            _id: new mongoose.Types.ObjectId(),
            price: 10,
        };

        const mockReservationData = {
            userId: new mongoose.Types.ObjectId(),
            showTimeId: mockShowTime._id,
            seats: ['A1', 'A2'],
        };

        it('should create a reservation successfully', async () => {
            ShowTime.findById.mockResolvedValue(mockShowTime);

            const mockSavedReservation = {
                ...mockReservationData,
                totalPrice: 20,
                _id: new mongoose.Types.ObjectId(),
            };

            Reservation.prototype.save.mockResolvedValue(mockSavedReservation);

            const result = await ReservationService.createReservation(mockReservationData);

            expect(ShowTime.findById).toHaveBeenCalledWith(mockReservationData.showTimeId);
            expect(result).toEqual(mockSavedReservation);
            expect(result.totalPrice).toBe(mockShowTime.price * mockReservationData.seats.length);
        });

        it('should throw error if showtime not found', async () => {
            ShowTime.findById.mockResolvedValue(null);

            await expect(ReservationService.createReservation(mockReservationData))
                .rejects
                .toThrow(new ApiError('Showtime not found', 404));
        });

        it('should handle database save errors', async () => {
            ShowTime.findById.mockResolvedValue(mockShowTime);
            const error = new Error('Database error');
            Reservation.prototype.save.mockRejectedValue(error);

            await expect(ReservationService.createReservation(mockReservationData))
                .rejects
                .toThrow(new ApiError(`Error Creating Reservation: ${error.message}`, 500));
        });
    });

    describe('updateReservation', () => {
        const mockReservationId = new mongoose.Types.ObjectId();

        it('should toggle reservation status from active to cancel', async () => {
            const mockReservation = {
                _id: mockReservationId,
                status: 'active',
                save: jest.fn(),
            };

            Reservation.findById.mockResolvedValue(mockReservation);
            mockReservation.save.mockResolvedValue({ ...mockReservation, status: 'cancel' });

            const result = await ReservationService.updateReservation(mockReservationId);

            expect(result.status).toBe('cancel');
            expect(Reservation.findById).toHaveBeenCalledWith(mockReservationId);
        });

        it('should toggle reservation status from cancel to active', async () => {
            const mockReservation = {
                _id: mockReservationId,
                status: 'cancel',
                save: jest.fn(),
            };

            Reservation.findById.mockResolvedValue(mockReservation);
            mockReservation.save.mockResolvedValue({ ...mockReservation, status: 'active' });

            const result = await ReservationService.updateReservation(mockReservationId);

            expect(result.status).toBe('active');
        });

        it('should throw error if reservation not found', async () => {
            Reservation.findById.mockResolvedValue(null);

            await expect(ReservationService.updateReservation(mockReservationId))
                .rejects
                .toThrow(new ApiError('Reservation not found', 404));
        });
    });

    describe('deleteReservation', () => {
        const mockReservationId = new mongoose.Types.ObjectId();

        it('should soft delete reservation successfully', async () => {
            const mockUpdatedReservation = {
                _id: mockReservationId,
                isDeleted: true,
            };

            Reservation.findByIdAndUpdate.mockResolvedValue(mockUpdatedReservation);

            const result = await ReservationService.deleteReservation(mockReservationId);

            expect(Reservation.findByIdAndUpdate).toHaveBeenCalledWith(
                mockReservationId,
                { isDeleted: true },
                { new: true }
            );
            expect(result).toEqual(mockUpdatedReservation);
        });

        it('should throw error if reservation not found', async () => {
            Reservation.findByIdAndUpdate.mockResolvedValue(null);

            await expect(ReservationService.deleteReservation(mockReservationId))
                .rejects
                .toThrow(new ApiError('Error Deleting Reservation: Reservation not found', 404));
        });
    });

    describe('viewUserReservations', () => {
        const mockUserId = new mongoose.Types.ObjectId();

        it('should return user reservations with populated data', async () => {
            const mockReservations = [
                {
                    _id: new mongoose.Types.ObjectId(),
                    userId: mockUserId,
                    showTimeId: {
                        movieId: {
                            name: 'Test Movie',
                            duration: 120,
                            category: 'Action',
                            image: 'image.jpg',
                        },
                        roomId: {
                            name: 'Room 1',
                        },
                    },
                },
            ];

            Reservation.find.mockReturnValue({
                populate: jest.fn().mockReturnValue(mockReservations),
            });

            const result = await ReservationService.viewUserReservations(mockUserId);

            expect(Reservation.find).toHaveBeenCalledWith({ userId: mockUserId });
            expect(result).toEqual(mockReservations);
        });
    });


    describe('viewReservation', () => {
        const mockReservationId = new mongoose.Types.ObjectId();

        it('should return single reservation with populated data', async () => {
            const mockReservation = {
                _id: mockReservationId,
                showTimeId: {
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
                },
            };

            Reservation.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockReservation),
            });

            const result = await ReservationService.viewReservation(mockReservationId);

            expect(Reservation.findById).toHaveBeenCalledWith(mockReservationId);
            expect(result).toEqual(mockReservation);
        });

        it('should throw error if reservation not found', async () => {
            Reservation.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(ReservationService.viewReservation(mockReservationId))
                .rejects
                .toThrow(new ApiError('Reservation not found', 404));
        });
    });
});