// utils/email.js
const nodemailer = require("nodemailer");
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
    constructor(user, url) {
        this.to = user.email;
        this.url = url;
        this.firstName = user.name.split(' ')[0];
        this.from = `Taimoor Khalid <${process.env.SENDER_EMAIL}>`
    }

    newTransporter() {
        if (process.env.NODE_ENV === "production") {
            // Brevo (Sendinblue) SMTP Transporter
            return nodemailer.createTransport({
                host: process.env.BREVO_HOST || "smtp-relay.brevo.com",
                port: process.env.BREVO_PORT || 587,
                auth: {
                    user: process.env.BREVO_USERNAME,
                    pass: process.env.BREVO_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
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
    }

    async send(template, subject) {
        //render the email template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject: subject
        });

        //define the mailOptions
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: htmlToText.convert(html)
        };
        //send the email
        await this.newTransporter().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', "Welcome to the Natours Family!");
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token (valid for only 10 minutes)'
        );
    }
}

module.exports = Email;