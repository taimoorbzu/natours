// utils/email.js
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        // Prevent infinite hanging:
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000
    });

    // 2. Define the email options
    const mailOptions = {
        from: "Taimoor Khalid <support@natours.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;