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
 * Unified Base HTML Template for Zain Fabrics Emails
 */
const getBaseHtml = (title, name, content, actionText = null, actionUrl = null) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        body { font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; color: #1a1a1a; }
        .wrapper { width: 100%; background-color: #f8f9fa; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid #edf2f7; }
        .header { background-color: #111111; padding: 40px; text-align: center; }
        .logo { color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; margin: 0; line-height: 1; }
        .logo-accent { color: #10b981; }
        .content { padding: 48px 40px; text-align: center; }
        .eyebrow { font-size: 13px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 16px; display: block; }
        .title { font-size: 32px; font-weight: 800; margin: 0 0 24px; color: #111111; letter-spacing: -0.5px; }
        .name { font-weight: 700; color: #111111; }
        .body-text { font-size: 16px; line-height: 1.625; color: #4a5568; margin-bottom: 32px; }
        .btn-container { margin: 40px 0; }
        .btn { background-color: #10b981; color: white; padding: 18px 36px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2); }
        .footer { background-color: #fcfcfc; padding: 32px 40px; text-align: center; border-top: 1px solid #f1f3f5; }
        .footer-text { font-size: 13px; color: #a0aec0; margin: 0; line-height: 1.5; font-weight: 500; }
        .social-links { margin-top: 20px; font-size: 11px; color: #cbd5e0; letter-spacing: 1px; text-transform: uppercase; font-weight: 700; }
        .divider { height: 1px; background-color: #edf2f7; margin: 32px 0; width: 100%; }
        .meta-container { background-color: #f7fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: left; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1 class="logo">ZAIN <span class="logo-accent">FABRICS</span></h1>
            </div>
            <div class="content">
                <span class="eyebrow">${title}</span>
                <h2 class="title">${title}</h2>
                <p class="body-text">
                    Hello <span class="name">${name}</span>,<br>
                    ${content}
                </p>
                ${actionText && actionUrl ? `
                <div class="btn-container">
                    <a href="${actionUrl}" class="btn">${actionText}</a>
                </div>
                ` : ''}
            </div>
            <div class="footer">
                <p class="footer-text">
                    &copy; ${new Date().getFullYear()} Zain Fabrics. All rights reserved.<br>
                    Crafting material excellence for the footwear industry.
                </p>
                <div class="social-links">
                    Quality &bull; Precision &bull; Sustainability
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

/**
 * Specific Template Generators
 */

export const getOTPHtml = (name, otp) => getBaseHtml(
    'Verification',
    name,
    `Use the verification code below to complete your sign-in. For your security, please do not share this code with anyone.`,
    null,
    null
).replace(`</p>`, `</p>
    <div style="background-color: #f7fafc; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center; border: 1px dashed #e2e8f0;">
        <h3 style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #111111; margin: 0; font-family: 'Courier New', monospace;">${otp}</h3>
        <p style="font-size: 13px; color: #a0aec0; margin: 12px 0 0; font-weight: 600;">CODE EXPIRES IN 10 MINUTES</p>
    </div>
`);

export const getWelcomeHtml = (name) => getBaseHtml(
    'Welcome to Zain Fabrics',
    name,
    `We're thrilled to have you join our global network of footwear material specialists. Explore our premium collections of interlinings, canvas, and reinforced fabrics designed for the world's leading brands.`,
    'Explore Collections',
    `${process.env.CLIENT_URL || 'https://consultancy-orpin-seven.vercel.app'}/products`
);

export const getOrderConfirmationHtml = (name, orderId, total) => getBaseHtml(
    'Order Confirmed',
    name,
    `Thank you for your order! We've received your business and are already preparing your materials for dispatch. Your Order ID is <strong>#${orderId}</strong> and the total amount is <strong>₹${total}</strong>.`,
    'View Order Details',
    `${process.env.CLIENT_URL || 'https://consultancy-orpin-seven.vercel.app'}/order/${orderId}`
);

export const getOrderShippedHtml = (name, orderId, trackingInfo) => getBaseHtml(
    'Order Dispatched',
    name,
    `Exciting news! Your order <strong>#${orderId}</strong> has been shipped and is on its way to your manufacturing facility. We've attached the tax invoice for your records. Tracking Info: <strong>${trackingInfo}</strong>.`,
    'Track Shipments',
    `${process.env.CLIENT_URL || 'https://consultancy-orpin-seven.vercel.app'}/profile`
);

export const getOrderOutHtml = (name, orderId) => getBaseHtml(
    'Out for Delivery',
    name,
    `Your order <strong>#${orderId}</strong> is out for delivery! Our logistics partner is currently on the move to your location. Please ensure someone is available to receive the materials.`,
    'View Order History',
    `${process.env.CLIENT_URL || 'https://consultancy-orpin-seven.vercel.app'}/profile`
);

export const getOrderDeliveredHtml = (name, orderId) => getBaseHtml(
    'Order Delivered',
    name,
    `Success! Your order <strong>#${orderId}</strong> has been delivered to your location. We hope you are satisfied with the quality of our fabrics. Thank you for choosing Zain Fabrics.`,
    'View Order History',
    `${process.env.CLIENT_URL || 'https://consultancy-orpin-seven.vercel.app'}/profile`
);

export const getOrderStatusUpdateHtml = (name, orderId, status, description) => getBaseHtml(
    'Order Status Update',
    name,
    `We've updated the status of your order <strong>#${orderId}</strong>. The current status is now: <span style="color: #10b981; font-weight: 800; text-transform: uppercase;">${status}</span>.<br><br><em>${description}</em>`,
    'View Order Details',
    `${process.env.CLIENT_URL || 'https://consultancy-orpin-seven.vercel.app'}/order/${orderId}`
);

export const getOrderCancelledHtml = (name, orderId, reason) => getBaseHtml(
    'Order Cancelled',
    name,
    `Your order <strong>#${orderId}</strong> has been successfully cancelled as per your request. ${reason ? `Reason: <em>${reason}</em>.` : ''} If you've already made a payment, a refund has been initiated.`,
    'Return to Store',
    `${process.env.CLIENT_URL || 'https://consultancy-orpin-seven.vercel.app'}/products`
);

export const getRefundUpdateHtml = (name, orderId, status) => getBaseHtml(
    'Refund Status Update',
    name,
    `We're writing to update you on the refund for order <strong>#${orderId}</strong>. The current status of your refund is: <span style="color: #10b981; font-weight: 800; text-transform: uppercase;">${status}</span>.`,
    'Check Account',
    `${process.env.CLIENT_URL || 'https://consultancy-orpin-seven.vercel.app'}/profile`
);

export const getAdminCustomEmailHtml = (name, subject, message) => getBaseHtml(
    subject || 'Communication from Zain Fabrics',
    name,
    message,
    'Visit Dashboard',
    `${process.env.CLIENT_URL || 'https://consultancy-orpin-seven.vercel.app'}`
);

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
            text, // Plain text fallback
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
