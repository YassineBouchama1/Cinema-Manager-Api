const express = require('express')
const { createAdminValidator } = require('./admin.validator')
const { createAdmin } = require('./admin.controller')
const { protect, allowedTo } = require('../../middleware/auth.middleware')


const router = express.Router()


//@access  : private : admin
router.route('/create')
    .post(createAdminValidator, protect, allowedTo('admin', 'super'), createAdmin)









module.exports = router