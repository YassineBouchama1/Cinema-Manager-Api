const ApiError = require("../utils/ApiError");



// this middlewar for :check if the user is a super admin or admin and if params.id is passed

const setUserId = (req, res, next) => {
    let userId;


    //1 check if user is super admin
    //2 check if admin if y


    if (req.user.role === 'super' && req.params.id) {
        userId = req.params.id; // super admin can edit any user
    } else if (req.user.role === 'admin' && req.params.id) {
        userId = req.params.id; // admin must specify which user they want to edit
    } else if (req.user && req.user.role !== 'super') {
        userId = req.user.userId; // regular user can only edit their own profile
    } else {
        return next(new ApiError('User ID is required or you must be an authenticated admin', 400));
    }

    req.userId = userId;
    next();
};

module.exports = setUserId;
