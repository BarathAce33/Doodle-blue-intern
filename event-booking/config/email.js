const nodemailer = require('nodemailer');

// Dynamic email config (Gmail/Mailtrap)
const transporterConfig = process.env.EMAIL_SERVICE === 'gmail'
    ? {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }
    : {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    };

const transporter = nodemailer.createTransport(transporterConfig);

module.exports = transporter; // Email helper
