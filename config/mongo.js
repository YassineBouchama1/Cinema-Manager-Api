const mongoose = require('mongoose')

const dotenv = require('dotenv')

dotenv.config({ path: '.env' })

const DB = process.env.DB_URL
const dbConnect = () => {
    mongoose.connect(DB)
        .then(() => {
            console.log('DB Conected')
        }).catch(() => {
            console.log('Pb in Conect DB')
        })
}

module.exports = dbConnect 