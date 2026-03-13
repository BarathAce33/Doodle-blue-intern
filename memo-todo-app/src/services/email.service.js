const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendOTPEmail(toEmail, otp) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'Memo-Todo App - Password Reset OTP',
            text: `Your OTP for resetting your password is: ${otp}. This OTP is valid for 15 minutes. If you did not request this, please ignore this email.`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending OTP email:', error);
            throw new Error('Failed to send OTP email');
        }
    }

    async sendTodoNotificationEmail(toEmail, taskName, expiryDate) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: `Memo-Todo App - Task Reminder: ${taskName}`,
            text: `Reminder: Your task "${taskName}" is scheduled for ${new Date(expiryDate).toLocaleString()}.`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending Todo notification email:', error);
            // We don't throw an error here to prevent the cron job from crashing
            return false;
        }
    }
}

// Exports
module.exports = new EmailService();
