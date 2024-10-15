const Room = require('../models/room.model');
const ApiError = require('../../../utils/ApiError');
const ShowTime = require('../../showtimes/models/showtime.model');

class RoomService {
    async createRoom(roomData) {
        const newRoom = new Room(roomData);
        try {
            const savedRoom = await newRoom.save();
            return savedRoom;
        } catch (error) {
            throw new ApiError(`Error Creating Room: ${error.message}`, 500);
        }
    }

    async deleteRoom(id) {
        const result = await Room.findByIdAndUpdate(id, { isDeleted: true }, { new: true });


        if (!result) {
            throw new ApiError(`Error Deleting Room: Room not found`, 404);
        }

        // mrk all associated showtimes as deleted
        await ShowTime.updateMany({ roomId: id }, { isDeleted: true });

        return result;
    }

    async viewRooms() {
        const rooms = await Room.find({ isDeleted: false });
        return rooms;
    }

    async viewRoom(id) {
        const room = await Room.findById(id);
        if (!room) {
            throw new ApiError(`No resource found with this ID`, 404);
        }
        return room;
    }

    async updateRoom(id, updateData) {
        const roomUpdated = await Room.findByIdAndUpdate(id, updateData, { new: true });
        if (!roomUpdated) {
            throw new ApiError(`Error Updating Room: Room not found`, 404);
        }
        return roomUpdated;
    }

    async viewRoomsPublic() {
        const rooms = await Room.find({ isDeleted: false });
        return rooms;
    }

    async viewRoomPublic(id) {
        const room = await Room.findById(id);
        if (!room) {
            throw new ApiError(`No room belongs to this ID`, 404);
        }
        return room;
    }
}

module.exports = new RoomService();