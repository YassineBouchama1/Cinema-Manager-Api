
const nodemailer = require("nodemailer");

// Nodemailer
const sendEmail = async (options) => {


    // fetch html form 
    const lettersDir = path.join(process.cwd(), "upload", "html");
    const letterContent = fs.readFileSync(
        path.join(lettersDir, `${letterId}.html`),
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
        html: letterContent,
    };

    // 3) Send email
    await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;