
const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const dbOps = require('../utils/DatabaseOperations');



const checkUserAccessToResource = (Model) =>
  expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const resource = await dbOps.findOne(Model, { _id: id });



    if (resource?.error) {
      return next(new ApiError(`Resource not found : ${resource.error}`, 500));
    }

    if (!resource.data) {
      return next(new ApiError(`No resource found with this ID`, 404));
    }

    // if super admin return true with data
    if (req.user.role === 'super' || req.user.role === 'user') {
      req.resource = resource.data;
      next();
    }




    req.resource = resource.data;
    next();
  });

module.exports = checkUserAccessToResource;
