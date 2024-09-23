const express = require('express')

const { protect, allowedTo } = require('../middlewares/guard')
const { createCinema, viewCinema, deleteCinema, viewCinemaPublic, viewCinemasPublic } = require('../controller/cinemaController')
const { createCinemaValidator } = require('../utils/validators/cinemaValidator')



const router = express.Router()


//@access  : private : admin
router.route('/')
    .post(protect, allowedTo('admin'), createCinemaValidator, createCinema)
    .get(viewCinemasPublic)



router.route('/:id')
    .delete(protect, allowedTo('admin'), deleteCinema)
    .get(protect, allowedTo('admin'), protect, viewCinema)



//@access  : public
router.route('/public/:id')
    .get(protect, viewCinemaPublic)







module.exports = router