const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const globalError = require('./middleware/globalError.middleware.js');
const dbConect = require('./config/db.config.js');
const authRoute = require('./modules/auth/auth.routes.js');
const movieRoute = require('./modules/movies/movie.routes.js');
const roomRoute = require('./modules/rooms/room.routes.js');
const showtimeRoute = require('./modules/showtimes/showtime.routes.js');
const reservationRoute = require('./modules/reservations/reservation.routes.js');
const userRoute = require('./modules/users/user.routes.js');
const adminRoute = require('./modules/admins/admin.routes.js');
const commentRoute = require('./modules/comments/comment.routes.js');
const ratingRoute = require('./modules/ratings/rating.routes.js');
const favoriteRoutes = require('./modules/favorites/favorite.routes.js');
const statisticsRoute = require('./modules/statistics/statistics.routes.js');
const subscribeRoute = require('./modules/subscriptions/subscription.routes');
const { swaggerUi, swaggerDocs } = require('./config/swagger.config.js');

const ApiError = require('./utils/ApiError');
const { trackVisits } = require('./middleware/trackVisits.middleware.js');

dotenv.config({ path: '../.env' });

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use(trackVisits); // this midlewar track visitors

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
app.use('/api/v1/rating', ratingRoute);
app.use('/api/v1/favorite', favoriteRoutes);
app.use('/api/v1/statistics', statisticsRoute);
app.use('/api/v1/subscribe', subscribeRoute);


// Handle 404 errors
app.all('*', (req, res, next) => {
    next(new ApiError(`Can't find this URL ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalError);

module.exports = app;