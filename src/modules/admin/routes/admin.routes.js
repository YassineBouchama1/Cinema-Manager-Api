const express = require('express')

const { protect, allowedTo } = require('../middleware/auth.middleware')
const { createAdminValidator } = require('../validators/adminValidator')
const { createAdmin } = require('../controllers/adminController')


const router = express.Router()


//@access  : private : admin
router.route('/create')
    .post(createAdminValidator, protect, allowedTo('admin', 'super'), createAdmin)









module.exports = router