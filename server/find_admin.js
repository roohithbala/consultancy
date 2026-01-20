import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zain-fabrics');
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('Admin User Found:', admin.email);
            // We can't see the password hash, so I'll hope '123456' or 'admin' works, or I'll create a temp admin
        } else {
            console.log('No Admin User Found');
        }
    } catch (e) { console.error(e); }
    finally { mongoose.disconnect(); }
};
run();
