
const expressAsyncHandler = require('express-async-handler');


const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');




require('dotenv').config();

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET

//CHECK IF TOKEN EXIST IF YES GET INFORMATION USER FROM IT TO PASS IT TO NEXT MIDDLEWARE SUCH AS CREATE PRODUCT GET ...
exports.protect = expressAsyncHandler(async (req, res, next) => {

    //1 check if token exist 
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
  
    if (!token) {
      return next(new ApiError('you are not login , plase login to get access  this route', 400))
    }
  
  
    //2) decoded Token 
    // token wont split
    const decoded = jwt.verify(token, JWT_SECRET)
  
    //3) check if user exist 
  
    const currentUser = await userModel.findById(decoded.userId)
  
  
    if (!currentUser) {
  
      return next(new ApiError('the user that belong to this token does no longer exist', 401))
  
    }
    // @Desc add data of user to reqist
    req.user = currentUser
    next()
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
  
  
  