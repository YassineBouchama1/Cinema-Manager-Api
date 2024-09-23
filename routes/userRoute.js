const express = require('express')

const { protect, allowedTo } = require('../middlewares/guard')
const { viewUser, deleteUser, viewUsers, updateUser } = require('../controller/userController')
const setUserId = require('../middlewares/setUserId')



const router = express.Router()


//@access  : private : admin

router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), setUserId, deleteUser)
    .put(protect, allowedTo('admin', 'super'), setUserId, updateUser)
    .get(protect, allowedTo('admin', 'super'), setUserId, viewUser)




router.route('/')
    .get(protect, allowedTo('admin', 'super'), viewUsers)






module.exports = router