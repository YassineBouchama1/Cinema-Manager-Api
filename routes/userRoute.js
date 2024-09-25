const express = require('express')

const { protect, allowedTo } = require('../middlewares/guard')
const { viewUser, deleteUser, viewUsers, updateUser, determineUserId, updateMyProfile } = require('../controllers/userController')



const router = express.Router()


//@access  : private : admin

router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), deleteUser)
    .put(protect, allowedTo('admin', 'super'), updateUser)
    .get(protect, allowedTo('admin', 'super'), viewUser)






router.route('/')
    .get(protect, allowedTo('admin', 'super'), viewUsers)
    .put(protect, allowedTo('admin', 'super'), updateMyProfile) // this route user can update his profile







module.exports = router