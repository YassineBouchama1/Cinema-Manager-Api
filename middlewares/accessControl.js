// accessControl.js (or any filename of your choice)
const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const NodeDaoMongodb = require('../service/node-dao-mongodb');

// get instance from service object
const nodeDaoMongodb = NodeDaoMongodb.getInstance();

const checkUserAccessToResource = (Model) =>
  expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { cinemaId } = req.user;

    const resource = await nodeDaoMongodb.findOne(Model, { _id: id, isDeleted: false });


    console.log(resource)
    if (resource?.error) {
      return next(new ApiError(`Error finding resource: ${resource.error}`, 500));
    }

    if (!resource.data) {
      return next(new ApiError(`No resource found with this ID`, 404));
    }

    // if super admin return true with data
    if (req.user.role === 'super') {
      req.resource = resource.data;
      next();
    }

    if (resource.data.cinemaId.toString() !== cinemaId.toString()) {
      return next(new ApiError('You do not have permission to access this resource', 403));
    }

    req.resource = resource.data;
    next();
  });

module.exports = checkUserAccessToResource;
