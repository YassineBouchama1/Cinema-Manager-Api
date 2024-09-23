const express = require('express')

const { protect, allowedTo } = require('../middlewares/guard')
const { viewUser, deleteUser } = require('../controller/userController')



const router = express.Router()


//@access  : private : admin

router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), deleteUser)
    .put(protect, allowedTo('admin', 'super'), updateUser)
    .get(protect, allowedTo('admin', 'super'), viewUser)







module.exports = router