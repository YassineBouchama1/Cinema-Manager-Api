const express = require('express')

const { protect, allowedTo } = require('../middlewares/guard')
const { createRoom, deleteRoom, viewRooms, viewRoom, viewRoomPublic, viewRoomsPublic, updateRoom } = require('../controller/roomController')
const { createRoomValidator, roomByIdValidator } = require('../validators/roomValidator')
const checkUserAccessToResource = require('../middlewares/accessControl')
const roomModel = require('../models/roomModel')



const router = express.Router()


//@access  : private : admin
router.route('/')
    .post(protect, allowedTo('admin', 'super'), createRoomValidator, createRoom)
    .get(protect, allowedTo('admin', 'super'), viewRooms)


router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), roomByIdValidator, checkUserAccessToResource(roomModel), deleteRoom)
    .get(protect, allowedTo('admin', 'super'), roomByIdValidator, checkUserAccessToResource(roomModel), viewRoom)
    .put(protect, allowedTo('admin', 'super'), roomByIdValidator, checkUserAccessToResource(roomModel), updateRoom)



//@access  : private : public
router.route('/public/:id')
    .get(viewRoomPublic)

router.route('/public')
    .get(viewRoomsPublic)







module.exports = router