const mongoose = require('mongoose');
const Comment = require('./comment.model');
const CommentService = require('./comment.service');
const ApiError = require('../../utils/ApiError');

// Mock the Comment model
jest.mock('./comment.model');

describe('CommentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createComment', () => {
        it('should create a new comment successfully', async () => {
            const mockCommentData = {
                text: 'Test comment',
                userId: new mongoose.Types.ObjectId(),
                movieId: new mongoose.Types.ObjectId()
            };

            const mockSavedComment = { ...mockCommentData, _id: new mongoose.Types.ObjectId() };

            // Mock the save method
            Comment.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(mockSavedComment)
            }));

            const result = await CommentService.createComment(mockCommentData);

            expect(result).toEqual(mockSavedComment);
            expect(Comment).toHaveBeenCalledWith(mockCommentData);
        });

        it('should throw ApiError when comment creation fails', async () => {
            const errorMessage = 'Database error';

            Comment.mockImplementation(() => ({
                save: jest.fn().mockRejectedValue(new Error(errorMessage))
            }));

            await expect(CommentService.createComment({}))
                .rejects
                .toThrow(ApiError);
        });
    });

    describe('getCommentsByMovie', () => {
        it('should return comments for a specific movie', async () => {
            const mockMovieId = new mongoose.Types.ObjectId();
            const mockComments = [
                {
                    _id: new mongoose.Types.ObjectId(),
                    text: 'Comment 1',
                    userId: { _id: new mongoose.Types.ObjectId(), name: 'User 1' },
                    createdAt: new Date()
                }
            ];

            Comment.find.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        sort: jest.fn().mockResolvedValue(mockComments)
                    })
                })
            });

            const result = await CommentService.getCommentsByMovie(mockMovieId);

            expect(result).toEqual(mockComments);
            expect(Comment.find).toHaveBeenCalledWith({
                movieId: mockMovieId,
                isDeleted: false
            });
        });
    });

    describe('deleteComment', () => {
        it('should delete a comment successfully', async () => {
            const mockCommentId = new mongoose.Types.ObjectId();
            const mockUserId = new mongoose.Types.ObjectId();
            const mockComment = {
                _id: mockCommentId,
                userId: mockUserId,
                text: 'Test comment',
                toString: () => mockUserId.toString()
            };

            const mockUpdatedComment = { ...mockComment, isDeleted: true };

            Comment.findById.mockResolvedValue(mockComment);
            Comment.findByIdAndUpdate.mockResolvedValue(mockUpdatedComment);

            const result = await CommentService.deleteComment(
                mockCommentId,
                mockUserId.toString()
            );

            expect(result).toEqual(mockUpdatedComment);
            expect(Comment.findById).toHaveBeenCalledWith(mockCommentId);
            expect(Comment.findByIdAndUpdate).toHaveBeenCalledWith(
                mockCommentId,
                { isDeleted: true },
                { new: true }
            );
        });

        it('should throw ApiError when comment is not found', async () => {
            Comment.findById.mockResolvedValue(null);

            await expect(CommentService.deleteComment(
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId().toString()
            ))
                .rejects
                .toThrow(new ApiError('Error Deleting Comment: Comment not found', 404));
        });

        it('should throw ApiError when user is not the owner', async () => {
            const mockCommentId = new mongoose.Types.ObjectId();
            const mockComment = {
                _id: mockCommentId,
                userId: new mongoose.Types.ObjectId(),
                text: 'Test comment',
                toString: () => new mongoose.Types.ObjectId().toString()
            };

            Comment.findById.mockResolvedValue(mockComment);

            await expect(CommentService.deleteComment(
                mockCommentId,
                new mongoose.Types.ObjectId().toString()
            ))
                .rejects
                .toThrow(new ApiError('Error Deleting Comment: You do not have permission to delete this comment', 403));
        });
    });
});