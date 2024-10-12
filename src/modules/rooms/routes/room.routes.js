const express = require('express')
const { protect, allowedTo } = require('../../../middleware/auth.middleware')
const { createRoomValidator, roomByIdValidator, updateRoomValidator } = require('../validators/room.validator')
const { createRoom, viewRooms, deleteRoom, viewRoom, updateRoom, viewRoomPublic, viewRoomsPublic } = require('../controllers/room.controller')
const checkUserAccessToResource = require('../../../middleware/accessControl.middleware')
const Room = require('../models/room.model')





const router = express.Router()


//@access  : private : admin
router.route('/')
    .post(protect, allowedTo('admin', 'super'), createRoomValidator, createRoom)
    .get(protect, allowedTo('admin', 'super'), viewRooms)


router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), roomByIdValidator, checkUserAccessToResource(Room), deleteRoom)
    .get(protect, allowedTo('admin', 'super'), roomByIdValidator, checkUserAccessToResource(Room), viewRoom)
    .put(protect, allowedTo('admin', 'super'), updateRoomValidator, checkUserAccessToResource(Room), updateRoom)



//@access  : private : public
router.route('/public/:id')
    .get(viewRoomPublic)

router.route('/public')
    .get(viewRoomsPublic)







module.exports = router