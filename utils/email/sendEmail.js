
const nodemailer = require("nodemailer");
const { confirmationEmail } = require("./emailTemplate");

// options : [email , ]
const sendEmail = async (options) => {

    try {


        // fetch html form 
        const lettersDir = path.join(process.cwd(), "upload", "html");
        const letterContent = fs.readFileSync(
            path.join(lettersDir, `confirmation.html`), // target wich file
            "utf-8"
        );


        // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)
        const transporter = nodemailer.createTransport({
            host: config.hostSmtp,
            port: config.portSmtp,
            secure: true,
            auth: {
                user: config.emailSmtp,
                pass: config.passSmtp,
            },
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