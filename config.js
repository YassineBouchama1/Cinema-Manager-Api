
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
exports.config = {
    emailSmtp: process.env.NEXT_PUBLIC_EMAIL_SMTP,
    passSmtp: process.env.NEXT_PUBLIC_PASS_SMTP,
    hostSmtp: process.env.NEXT_PUBLIC_HOST_SMTP,
    portSmtp: process.env.NEXT_PUBLIC_PORT_SMTP,
    host: process.env.NEXT_PUBLIC_BASE_URL,
    frontUrl: process.env.NEXT_PUBLIC_FRONT_URL,
    projectName: 'Cenima Manager'
};

