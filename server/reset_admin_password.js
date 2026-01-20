import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zain-fabrics');
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('Found Admin:', admin.email);
            admin.password = '123456'; // Will be hashed by pre-save hook
            await admin.save();
            console.log('Password reset to 123456');
        } else {
            console.log('No Admin Found');
        }
    } catch (e) { console.error(e); }
    finally { mongoose.disconnect(); }
};
run();
