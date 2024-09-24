
const expressAsyncHandler = require('express-async-handler');


const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const DatabaseOperations = require('../utils/DatabaseOperations'); const UserModel = require('../models/userModel');

require('dotenv').config();

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET


// get instance from service object
const dbOps = DatabaseOperations.getInstance();


//CHECK IF TOKEN EXIST IF YES GET INFORMATION USER FROM IT TO PASS IT TO NEXT MIDDLEWARE SUCH AS CREATE PRODUCT GET ...
exports.protect = expressAsyncHandler(async (req, res, next) => {




  //1 check if token exist 
  let token;



  // if passed token in params need this in
  //TODO: Chnage this way to another way more secure
  // Extract token from query parameter
  const { forget = null } = req.query;

  if (forget) {
    token = forget;
  }


  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }





  if (!token) {
    return next(new ApiError('you are not login , plase login to get access  this route', 400))
  }

  try {


    //2) decoded Token 
    // token wont split
    const decoded = jwt.verify(token, JWT_SECRET)



    //3) fetch user
    const result = await dbOps.findOne(UserModel, { _id: decoded.userId })

    //4) check if user exist 
    if (result?.error) {
      return next(new ApiError(`Error finding user: ${result.error}`, 500));
    }

    const currentUser = result.data;


    if (!currentUser) {

      return next(new ApiError('the user that belong to this token does no longer exist', 401))

    }

    // @Desc add data of user to reqist
    req.user = currentUser
    next()

  } catch (err) {

    if (err.name === 'TokenExpiredError') {
      return next(new ApiError('Your token has expired, please login again', 401));
    } else {
      return next(new ApiError('Invalid token, please login again', 401));
    }
  }
})





// @desc    Authorization (User Permissions)
// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  expressAsyncHandler(async (req, res, next) => {


    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this route', 403)
      );
    }
    next();
  });


