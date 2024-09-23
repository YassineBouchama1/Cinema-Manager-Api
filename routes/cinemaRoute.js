const express = require('express')

const { protect, allowedTo } = require('../middlewares/guard')
const { createCinema, viewCinema, deleteCinema, viewCinemas } = require('../controller/cinemaController')
const { createCinemaValidator } = require('../utils/validators/cinemaValidator')



const router = express.Router()


//@access  : private : admin
router.route('/')
    .post(protect, allowedTo('admin'), createCinemaValidator, createCinema)
    .post(protect, viewCinemas)

router.route('/:id')
    .delete(protect, allowedTo('admin'), deleteCinema)
    .post(protect, viewCinema)










module.exports = router