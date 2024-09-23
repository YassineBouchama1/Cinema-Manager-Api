const express = require('express')

const { protect, allowedTo } = require('../middlewares/guard')
const { createRoom, deleteRoom, viewRooms, viewRoom, viewRoomPublic, viewRoomsPublic } = require('../controller/roomController')
const { createRoomValidator } = require('../utils/validators/roomValidator')



const router = express.Router()


//@access  : private : admin
router.route('/')
    .post(createRoomValidator, protect, allowedTo('admin', 'super'), createRoom)
    .get(protect, allowedTo('admin', 'super'), viewRooms)

router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), deleteRoom)
    .get(protect, allowedTo('admin', 'super'), viewRoom)



//@access  : private : public
router.route('/public/:id')
    .get(viewRoomPublic)

router.route('/public')
    .get(viewRoomsPublic)







module.exports = router