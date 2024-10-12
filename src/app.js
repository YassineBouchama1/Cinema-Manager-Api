const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const globalError = require('./middleware/globalError.middleware.js');
const dbConect = require('./config/db.config.js');
const authRoute = require('./modules/auth/routes/auth.routes');
const movieRoute = require('./modules/movies/routes/movie.routes');
const roomRoute = require('./modules/rooms/routes/room.routes');
const showtimeRoute = require('./modules/showtimes/routes/showtime.routes');
const reservationRoute = require('./modules/reservations/routes/reservation.routes');
const userRoute = require('./modules/users/routes/user.routes');
const adminRoute = require('./modules/admins/routes/admin.routes');

const ApiError = require('./utils/ApiError');

dotenv.config({ path: '../.env' });

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'public')));

// Connect to the database
dbConect(); // Comment this out if you start testing

// Check if 'cinema' bucket exists
// minioClient.bucketExists('cinema', (err, exists) => {
//     if (err) {
//         return console.log(err); // Debugging errors
//     }
//     if (!exists) {
//         minioClient.makeBucket('cinema', 'us-east-1', (err) => {
//             if (err) return console.log('Error creating bucket.', err);
//             console.log('Bucket created successfully.');
//         });
//     }
//     console.log('Bucket already created');
// });

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/movie', movieRoute);
app.use('/api/v1/room', roomRoute);
app.use('/api/v1/showtime', showtimeRoute);
app.use('/api/v1/reservation', reservationRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/admin', adminRoute);


// Handle 404 errors
app.all('*', (req, res, next) => {
    next(new ApiError(`Can't find this URL ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalError);

module.exports = app;