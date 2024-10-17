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
const commentRoute = require('./modules/comments/routes/comment.routes');
const ratingRoutes = require('./modules/ratings/routes/rating.routes');
const favoriteRoutes = require('./modules/favorites/routes/favorite.routes');
const { swaggerUi, swaggerDocs } = require('./config/swagger.config.js');

const ApiError = require('./utils/ApiError');

dotenv.config({ path: '../.env' });

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'public')));

// Connect to the database
dbConect(); // Comment this out if you start testing



app.get('/', (req, res) => {
    res.send('Hello World!');
});


// swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/movie', movieRoute);
app.use('/api/v1/room', roomRoute);
app.use('/api/v1/showtime', showtimeRoute);
app.use('/api/v1/reservation', reservationRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/admin', adminRoute);
app.use('/api/v1/comment', commentRoute);
app.use('/api/v1/rating', ratingRoutes);
app.use('/api/v1/favorite', favoriteRoutes);


// Handle 404 errors
app.all('*', (req, res, next) => {
    next(new ApiError(`Can't find this URL ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalError);

module.exports = app;