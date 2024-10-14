const express = require('express')
const { protect, allowedTo } = require('../../../middleware/auth.middleware')
const { deleteUser, updateUser, viewUser, viewUsers, updateMyProfile, myProfile, updateSubscription } = require('../controllers/user.controller')




const router = express.Router()



// make it first 
router.route('/me')
    .get(protect, myProfile)

router.route('/subscribe')
    .put(protect, allowedTo('user'), updateSubscription)



//@access  : private : admin

router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), deleteUser)
    .put(protect, allowedTo('admin', 'super'), updateUser)
    .get(viewUser)






router.route('/')
    .get(protect, allowedTo('admin', 'super'), viewUsers)
    .put(protect, updateMyProfile) // this route user can update his profile






module.exports = router