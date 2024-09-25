const jwt = require('jsonwebtoken')

const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET





// create token by passing id user
exports.createToken = (payload, expiresIn = '30d') => jwt.sign(payload, JWT_SECRET, { expiresIn })
