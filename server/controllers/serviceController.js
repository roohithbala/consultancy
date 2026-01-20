import ServiceRequest from '../models/ServiceRequest.js';

import nodemailer from 'nodemailer';

// @desc    Create a new service request
// @route   POST /api/services
// @access  Public
const createServiceRequest = async (req, res) => {
    try {
        const { name, email, phone, serviceType, message } = req.body;

        const serviceRequest = await ServiceRequest.create({
            name,
            email,
            phone,
            serviceType,
            message
        });

        // Send confirmation email
        // NOTE: For production, use environment variables for email credentials
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your preferred service
            auth: {
                user: process.env.EMAIL_USER || 'test@example.com',
                pass: process.env.EMAIL_PASS || 'password'
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@zainfabrics.com',
            to: email,
            subject: 'Service Request Received - Zain Fabrics',
            text: `Dear ${name},\n\nWe have received your request for "${serviceType}".\n\nOur team will review your requirements and get back to you shortly.\n\nThank you,\nZain Fabrics Team`
        };

        // Attempt to send email but don't block the response if it fails (unless critical)
        try {
            if (process.env.EMAIL_USER) {
                await transporter.sendMail(mailOptions);
            } else {
                console.log('Skipping email send: EMAIL_USER env var not set.');
                console.log('Would have sent to:', email);
            }

        } catch (emailError) {
            console.error('Error sending email:', emailError);
        }

        res.status(201).json(serviceRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { createServiceRequest };
