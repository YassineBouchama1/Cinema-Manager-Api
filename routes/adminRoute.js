const express = require('express')

const { protect, allowedTo } = require('../middlewares/guard')
const { createAdminValidator } = require('../utils/validators/adminValidator')
const { createAdmin } = require('../controller/adminController')


const router = express.Router()


//@access  : private : admin
router.route('/create')
    .post(createAdminValidator, protect, allowedTo('admin'), createAdmin)









module.exports = router