const express = require('express')

const { protect, allowedTo } = require('../middlewares/guard')
const { createRoom, deleteRoom, viewRooms, viewRoom } = require('../controller/roomController')



const router = express.Router()


//@access  : private : admin
router.route('/')
    .post(protect, allowedTo('admin'), createRoom)
    .post(protect, viewRooms)

router.route('/:id')
    .delete(protect, allowedTo('admin'), deleteRoom)
    .post(protect, viewRoom)










module.exports = router