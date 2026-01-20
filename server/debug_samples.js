import mongoose from 'mongoose';
import Order from './models/Order.js';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zain-fabrics');

        // 1. Find ANY order with type 'sample'
        const ANY_SAMPLE_ORDER = await Order.findOne({ 'orderItems.type': 'sample' });
        console.log('--- Random Sample Order ---');
        console.log(JSON.stringify(ANY_SAMPLE_ORDER, null, 2));

        if (ANY_SAMPLE_ORDER) {
            const userId = ANY_SAMPLE_ORDER.user;
            const productItem = ANY_SAMPLE_ORDER.orderItems.find(item => item.type === 'sample');
            const productId = productItem.product;

            console.log('\n--- Testing Query ---');
            console.log(`User: ${userId}`);
            console.log(`Product: ${productId}`);

            const orders = await Order.find({
                user: userId,
                'orderItems.product': productId,
                'orderItems.type': 'sample'
            });
            console.log(`Found ${orders.length} orders via Query.`);
        } else {
            console.log('No sample orders found in DB at all.');
        }

    } catch (e) { console.error(e); }
    finally { mongoose.disconnect(); }
};
run();
