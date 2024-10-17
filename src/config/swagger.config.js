const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Cinema Reservation API',
            version: '1.0.0',
            description: 'API for managing cinema reservations, users, movies, and more.',
        },
        servers: [
            {
                url: 'http://localhost:4000',
            },
        ],
    },

    apis: [
        './modules/users/controllers/*.js',
        './modules/movies/controllers/*.js',
        './modules/rooms/controllers/*.js',
        './modules/showtimes/controllers/*.js',
        './modules/reservations/controllers/*.js',
        './modules/comments/controllers/*.js',
        './modules/ratings/controllers/*.js',
        './modules/admins/controllers/*.js',

    ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };