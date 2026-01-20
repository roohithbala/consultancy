import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmail = async (to, subject, text, attachments = []) => {
    // Debug Log
    console.log(`[Email Debug] Attempting to send email to: ${to}`);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('[Email Debug] Missing EMAIL_USER or EMAIL_PASS in .env');
        return false;
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('[Email Debug] Email sent successfully: ' + info.response);
        return true;
    } catch (error) {
        console.error('[Email Debug] Error sending email:', error);
        return false;
    }
};
