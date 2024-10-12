const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.name} | ${err.message}`);
    server.close(() => {
        console.error('Shutting down...');
        process.exit(1);
    });
});