const reservationController = require('../../../../controllers/reservationController');
const dbOps = require('../../../../utils/DatabaseOperations');
const ApiError = require('../../../../utils/ApiError');
const sendEmail = require('../../../../utils/email/sendEmail');
const ShowTimeModel = require('../../../../models/showTimeModel');
const ReservationModel = require('../../../../models/reservationModel');

jest.mock('../../../../utils/DatabaseOperations');
jest.mock('../../../../utils/email/sendEmail');
jest.mock('../../../../models/showTimeModel');
jest.mock('../../../../models/reservationModel');

describe('Reservation Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: { id: 'userId123', email: 'user@example.com', name: 'John Doe' },
            resource: { id: 'reservationId123', status: 'active' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe('createReservation', () => {
        it('should create a reservation successfully', async () => {
            req.body = { seats: ['A1', 'A2'], showTimeId: 'showTimeId123' };
            dbOps.findOne.mockResolvedValue({ data: { price: 10 } });
            dbOps.insert.mockResolvedValue({ data: { _id: 'reservationId123' } });
            sendEmail.mockResolvedValue({ success: true });

            await reservationController.createReservation(req, res, next);

            expect(dbOps.findOne).toHaveBeenCalledWith(ShowTimeModel, { _id: 'showTimeId123' });

            expect(dbOps.insert).toHaveBeenCalledWith(ReservationModel, {
                userId: 'userId123',
                showTimeId: 'showTimeId123',
                seats: ['A1', 'A2'],
                totalPrice: 20,
            });
            expect(sendEmail).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ data: { _id: 'reservationId123' }, message: 'Reservation created successfully' });
        });

        it('should return error if showtime is not found', async () => {
            req.body = { seats: ['A1'], showTimeId: 'showTimeId123' };
            dbOps.findOne.mockResolvedValue(null);

            await reservationController.createReservation(req, res, next);

            expect(next).toHaveBeenCalledWith(new ApiError('Showtime not found', 404));
        });

        it('should return error if inserting reservation fails', async () => {
            req.body = { seats: ['A1'], showTimeId: 'showTimeId123' };
            dbOps.findOne.mockResolvedValue({ data: { price: 10 } });
            dbOps.insert.mockResolvedValue({ error: 'Insert error' });

            await reservationController.createReservation(req, res, next);

            expect(next).toHaveBeenCalledWith(new ApiError('Error Creating Reservation: Insert error', 500));
        });



        it('should return error if sending email fails', async () => {
            req.body = { seats: ['A1'], showTimeId: 'showTimeId123' };
            dbOps.findOne.mockResolvedValue({ data: { price: 10 } });
            dbOps.insert.mockResolvedValue({ data: { _id: 'reservationId123' } });
            sendEmail.mockResolvedValue({ success: false, error: 'Email error' });

            await reservationController.createReservation(req, res, next);

            expect(next).toHaveBeenCalledWith(new ApiError(`Error sending email Confirmation`, 500));
        });
    });




    describe('updateReservation', () => {
        it('should update the reservation status successfully', async () => {
            dbOps.update.mockResolvedValue({ id: 'reservationId123', status: 'cancel' });

            await reservationController.updateReservation(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 'reservationId123', status: 'cancel' });
        });

        it('should return error if updating fails', async () => {
            dbOps.update.mockResolvedValue({ error: 'Update error' });

            await reservationController.updateReservation(req, res, next);

            expect(next).toHaveBeenCalledWith(new ApiError('Error Canceling Reservation: Update error', 500));
        });
    });

    describe('deleteReservation', () => {
        it('should delete the reservation successfully', async () => {
            dbOps.softDelete.mockResolvedValue({ success: true });

            await reservationController.deleteReservation(req, res, next);

            expect(dbOps.softDelete).toHaveBeenCalledWith(ReservationModel, { _id: 'reservationId123' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it('should return error if deleting fails', async () => {
            dbOps.softDelete.mockResolvedValue({ error: 'Delete error' });

            await reservationController.deleteReservation(req, res, next);

            expect(next).toHaveBeenCalledWith(new ApiError('Error Deleting Reservation: Delete error', 500));
        });
    });


});
