import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587 (STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
    },
    connectionTimeout: 15000, 
    greetingTimeout: 15000,
    socketTimeout: 15000
});

/**
 * Stunning HTML Email Template for OTP
 */
const getOTPHtml = (name, otp) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
        .header { background-color: #000000; padding: 40px; text-align: center; }
        .logo { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; margin: 0; }
        .content { padding: 40px; text-align: center; color: #333333; }
        .welcome { font-size: 14px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; display: block; }
        .title { font-size: 28px; font-weight: 700; margin: 0 0 20px; color: #111111; }
        .description { font-size: 16px; line-height: 1.6; color: #666666; margin-bottom: 30px; }
        .otp-container { background-color: #f8f9fa; border: 1px dashed #dddddd; border-radius: 16px; padding: 30px; margin-bottom: 30px; }
        .otp-code { font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #000000; margin: 0; font-family: 'Courier New', monospace; }
        .expiry { font-size: 13px; color: #999999; margin-top: 20px; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee; }
        .footer-text { font-size: 12px; color: #aaaaaa; margin: 0; line-height: 1.5; }
        .brand-color { color: #10b981; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">ZAIN <span class="brand-color">FABRICS</span></h1>
        </div>
        <div class="content">
            <span class="welcome">Security First</span>
            <h2 class="title">Verification Code</h2>
            <p class="description">Hello ${name},<br>Use the following code to complete your login. To protect your account, do not share this code with anyone.</p>
            
            <div class="otp-container">
                <h3 class="otp-code">${otp}</h3>
                <p class="expiry">This code expires in 10 minutes</p>
            </div>
            
            <p class="description" style="font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p class="footer-text">
                &copy; 2024 Zain Fabrics. All rights reserved.<br>
                Engineered shoe materials for the world's leading brands.
            </p>
        </div>
    </div>
</body>
</html>
`;

export const sendEmail = async (to, subject, text, attachments = [], html = null) => {
    console.log(`[Email] Attempting SEND to: ${to}`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('[Email] ERROR: Missing credentials in .env');
        return false;
    }

    try {
        const mailOptions = {
            from: `"Zain Fabrics" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || text,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('[Email] SUCCESS: ' + info.response);
        return true;
    } catch (error) {
        console.error('[Email] CONNECTION ERROR:', error.message);
        return false;
    }
};

// Export the template generator as well
export { getOTPHtml };
