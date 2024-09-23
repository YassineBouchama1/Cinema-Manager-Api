const express = require('express')

const { protect, allowedTo } = require('../middlewares/guard')
const { createRoom, deleteRoom, viewRooms, viewRoom, viewRoomPublic, viewRoomsPublic, updateRoom } = require('../controller/roomController')
const { createRoomValidator, roomByIdValidator } = require('../utils/validators/roomValidator')
const checkUserAccessToResource = require('../middlewares/accessControl')
const roomModel = require('../models/roomModel')



const router = express.Router()


//@access  : private : admin
router.route('/')
    .post(createRoomValidator, protect, allowedTo('admin', 'super'), createRoom)
    .get(protect, allowedTo('admin', 'super'), viewRooms)

router.route('/:id')
    .delete(roomByIdValidator, protect, allowedTo('admin', 'super'), checkUserAccessToResource(roomModel), deleteRoom)
    .get(roomByIdValidator, protect, allowedTo('admin', 'super'), checkUserAccessToResource(roomModel), viewRoom)
    .put(roomByIdValidator, protect, allowedTo('admin', 'super'), checkUserAccessToResource(roomModel), updateRoom)



//@access  : private : public
router.route('/public/:id')
    .get(viewRoomPublic)

router.route('/public')
    .get(viewRoomsPublic)







module.exports = router