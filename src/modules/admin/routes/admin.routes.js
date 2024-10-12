const express = require('express')


const router = express.Router()


//@access  : private : admin
router.route('/create')
    .post(createAdminValidator, protect, allowedTo('admin', 'super'), createAdmin)









module.exports = router