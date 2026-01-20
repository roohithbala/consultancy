import mongoose from 'mongoose';
import Order from './models/Order.js';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zain-fabrics');
        console.log('Connected to DB');

        const totalOrders = await Order.countDocuments({});
        console.log('Total Orders:', totalOrders);

        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .lean();

        console.log('Recent Orders (Count):', recentOrders.length);
        recentOrders.forEach((order, idx) => {
            console.log(`Order ${idx + 1}:`);
            console.log(`  ID: ${order._id}`);
            console.log(`  Created At: ${order.createdAt}`);
            console.log(`  User: ${order.user ? order.user.name : 'NULL'}`);
            console.log(`  Status: ${order.status}`);
        });

        // Check for orders without createdAt
        const noTimestamp = await Order.countDocuments({ createdAt: { $exists: false } });
        console.log('Orders without createdAt:', noTimestamp);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
};

run();
