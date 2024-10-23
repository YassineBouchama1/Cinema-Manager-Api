const fs = require('fs');
const path = require('path');

// create logs directory if it doesnt exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logFilePath = path.join(logsDir, 'email_errors.log');

// function to log email errors
function logEmailError({ userId, email, name, error,category }) {
    const logMessage = `
    User ID: ${userId}
    Name: ${name}
    Email: ${email}
    Category: ${category}
    Error: ${error}
    Time: ${new Date().toISOString()}
        -----------------------------------
    `;

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file', err);
        }
    });
}




module.exports = { logEmailError };
