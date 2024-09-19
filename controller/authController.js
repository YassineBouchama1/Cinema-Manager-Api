const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs');

const dotenv = require('dotenv')

dotenv.config({ path: './config.env' })
const Jwt = process.env.JWT

const expressAsyncHandler = require('express-async-handler')

const userModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');


// @Desc make sure key legnth  between 32 & 50
const SECRET_KEY_JWT = 'Yassine.info'

// create token by passing id user
const createToken = (payload) => jwt.sign({ userId: payload }, 'Yassine.info')


exports.signUp = expressAsyncHandler(async (req, res, next) => {

  try {

    const salt = await bcrypt.genSaltSync(10);

    //1 create user 

    const user = await userModel.create({

      nameStore: req.body.nameStore,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, salt)
    })



    res.status(201).json({ data: user })

  } catch (error) {
    return next(new ApiError(`Error Creating Account Procc: ${error.message}`, 500));
  }
})



// @desc    mark task is done
// @route   PUT /api/v1/list
// @access  Private/User
exports.login = expressAsyncHandler(async (req, res, next) => {

  try {
    //1 check if user aleady has account

    const user = await userModel.findOne({ email: req.body.email })

    // 2 - match token
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {

      return next(new ApiError(`email or passowrd uncourrect`, 404));
    }

    //3 creeate token 
    const token = await createToken(user._id)

    res.status(200).json({ data: user, token })
  } catch (error) {
    return next(new ApiError(`Error Login Procc: ${error.message}`, 500));
  }

})





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
  const decoded = jwt.verify(token, 'Yassine.info')

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


