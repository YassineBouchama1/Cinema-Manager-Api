const jwt = require('jsonwebtoken')

const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });


const createToken = (payload, expiresIn = '30d') => {
    if (!process.env.NEXT_PUBLIC_JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(payload, process.env.NEXT_PUBLIC_JWT_SECRET, { expiresIn });
};

module.exports = { createToken };