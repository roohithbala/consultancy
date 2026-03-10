import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { sendEmail, getOTPHtml, getWelcomeHtml } from '../utils/sendEmail.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Register a new user
 */
const registerUser = async (req, res) => {
    const { name, email, password, companyName, phone, gstNo } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            companyName,
            phone,
            gstNo,
        });

        if (user) {
            console.log('User created successfully:', email);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                companyName: user.companyName,
                gstNo: user.gstNo,
                token: generateToken(user._id),
            });

            // Send Welcome Email
            sendEmail(
                user.email,
                'Welcome to Zain Fabrics',
                `Welcome to Zain Fabrics, ${user.name}! We're glad to have you with us.`,
                [],
                getWelcomeHtml(user.name)
            ).catch(err => console.error('Welcome email failed:', err));
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

/**
 * @desc    Auth user & get token
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log('Login failed: User not found -', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.password) {
            console.log('Login failed: Social-only account -', email);
            return res.status(401).json({ 
                message: 'This account uses Google Login. Please use the Google sign-in button.' 
            });
        }

        const isMatch = await user.matchPassword(password);
        if (isMatch) {
            console.log('Password matched for:', email);
            
            // Check if 2SV is enabled
            if (user.is2SVEnabled) {
                // Generate 6-digit OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.otp = otp;
                user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
                await user.save();

                console.log('[2SV] Triggering email for:', email);
                // Send OTP Email
                const emailSent = await sendEmail(
                    user.email,
                    'Login Verification Code',
                    `Your verification code is: ${otp}. It will expire in 10 minutes.`,
                    [],
                    getOTPHtml(user.name, otp)
                );

                if (emailSent) {
                    return res.json({
                        require2SV: true,
                        userId: user._id,
                        email: user.email,
                        message: 'Verification code sent to email'
                    });
                } else {
                    return res.status(500).json({ message: 'Error sending verification email' });
                }
            }

            // Standard login if 2SV is disabled
            console.log('Login successful (2SV Disabled):', email);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                companyName: user.companyName,
                gstNo: user.gstNo,
                token: generateToken(user._id),
            });
        } else {
            console.log('Login failed: Incorrect password -', email);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Server Error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

/**
 * @desc    Google Login
 */
const googleLogin = async (req, res) => {
    const { tokenId, phone, companyName, gstNo } = req.body;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    
    if (!tokenId) {
        return res.status(400).json({ message: 'No Google token provided' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: GOOGLE_CLIENT_ID,
        });

        const { name, email, sub: googleId } = ticket.getPayload();
        console.log('Google login for:', email);

        let user = await User.findOne({ $or: [{ email }, { googleId }] });

        if (user) {
            if (!user.googleId) user.googleId = googleId;
            if (phone) user.phone = phone;
            if (companyName) user.companyName = companyName;
            if (gstNo) user.gstNo = gstNo;
            await user.save();
        } else {
            user = await User.create({
                name, email, googleId, phone, companyName, gstNo
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            companyName: user.companyName,
            gstNo: user.gstNo,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};

/**
 * @desc    Verify OTP and log user in
 */
const verifyOTP = async (req, res) => {
    const { userId, otp } = req.body;
    console.log('[2SV] Verifying OTP for User ID:', userId);

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Clear OTP after successful verification
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        console.log('[2SV] Successful for:', user.email);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            companyName: user.companyName,
            gstNo: user.gstNo,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

// Explicit exports for better module compatibility
export { registerUser, loginUser, googleLogin, verifyOTP };
