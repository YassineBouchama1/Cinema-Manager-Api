
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });
const { config } = require("../../config/global.config");
// options : [email ,subject ]
const sendEmail = async (options) => {

    console.log(options)

    try {



        // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)
        const transporter = nodemailer.createTransport({
            host: config.hostSmtp,
            port: config.portSmtp,
            secure: true,
            auth: {
                user: config.emailSmtp,
                pass: config.passSmtp,
            },
            family: 4 // Use IPv4
        });


        // 2) Define email options (like from, to, subject, email content)
        const mailOpts = {
            from: config.emailSmtp,
            to: options.email,
            subject: options.subject,
            html: options.html,
        };

        // 3) Send email
        await transporter.sendMail(mailOpts);


        return { message: "Emails sent successfully", success: true }
    } catch (error) {
        console.error("Error sending emails:", error);
        return { message: "Error sending emails", success: false }

    }
};

module.exports = sendEmail;