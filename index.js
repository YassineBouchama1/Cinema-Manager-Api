const express = require('express');
const app = express();
const dotenv = require('dotenv');
const globalError = require('./middlewares/globalError');
const dbConect = require('./config/dbConnect');
const path = require('path');
const authRoute = require('./routes/authRoute');
const adminRoute = require('./routes/adminRoute');
const roomRoute = require('./routes/roomRoute');
const cinemaRoute = require('./routes/cinemaRoute');
const userRoute = require('./routes/userRoute');
const movieRoute = require('./routes/movieRoute');
const showtimeRoute = require('./routes/showtimeRoute');
const publicRoute = require('./routes/publicRoute');
const ApiError = require('./utils/ApiError');

const PORT = process.env.PORT || 4000;


dotenv.config({ path: '.env' });


// middlewars
app.use(express.json());// Parse JSON bodies
app.use(express.static(path.join(__dirname, 'uploads')))


// conect db
dbConect();




app.get('/', (req, res) => {
    res.send('Hello World!');
});




// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/admin', adminRoute);
app.use('/api/v1/room', roomRoute);
app.use('/api/v1/cinema', cinemaRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/movie', movieRoute);
app.use('/api/v1/showtime', showtimeRoute);
app.use('/api/v1/public', publicRoute);



// Handle 404 errors
app.all('*', (req, res, next) => {
    next(new ApiError(`Can't find this url ${req.originalUrl}`, 404));
});


// Global error handler
app.use(globalError);




const server = app.listen(PORT, () => {
    console.log(`Server working on Port: ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
    server.close(() => {
        console.error(`Shutting Down...`);
        process.exit(1);
    });
}); PORT

module.exports = app; 