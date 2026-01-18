import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/User.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zain-fabrics');
        console.log('MongoDB Connected'.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
};

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();

        const createdReferenceUser = await User.create({
            name: 'Admin User',
            email: 'admin@zain.com',
            password: 'password123',
            role: 'admin',
            phone: '9999999999',
            companyName: 'Zain Fabrics Internal'
        });

        console.log(`Admin User Created: ${createdReferenceUser.email} / password123`.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany(); // Be careful, this deletes all users!

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
