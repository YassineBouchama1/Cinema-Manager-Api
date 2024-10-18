const express = require('express');
const { protect, allowedTo } = require('../../middleware/auth.middleware');
const { deleteUser, updateUser, viewUser, viewUsers, updateMyProfile, myProfile, updateSubscription } = require('./user.controller');
const upload = require('../../middleware/upload.middleware');
const { uploadMediaAvatar } = require('./user.service');
const { updateUserValidator } = require('./user.validator');

const router = express.Router();

router.route('/me')
    .get(protect, myProfile);

router.route('/subscribe')
    .put(protect, allowedTo('user'), updateSubscription);

router.route('/:id')
    .delete(protect, allowedTo('admin', 'super'), deleteUser)
    .put(protect, allowedTo('admin', 'super'), updateUser)
    .get(viewUser);

router.route('/')
    .get(protect, allowedTo('admin', 'super'), viewUsers)
    .put(protect, upload, uploadMediaAvatar, updateUserValidator, updateMyProfile);

module.exports = router;