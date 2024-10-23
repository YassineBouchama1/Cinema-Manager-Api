// config/swagger.config.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Cinema API Title',
            version: '1.0.0',
            description: 'API documentation for your application',
        },
        servers: [
            {
                url: 'http://localhost:4000/api/v1',
            },
        ],
    },
    apis: [
        './src/modules/**/*.routes.js',
        './src/modules/**/*.swagger.yaml',
    ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };