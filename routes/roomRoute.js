const express = require('express')

const { protect, allowedTo } = require('../middlewares/guard')



const router = express.Router()


//@access  : private : admin
router.route('/create')
    .post(protect, allowedTo('admin'), createRoom)











module.exports = router