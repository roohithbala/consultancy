import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5003/api';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // 1. Get Admin User (or creating a dummy user would be better, but let's use admin)
        const user = await User.findOne({ email: 'admin@zain.com' });
        if (!user) throw new Error('User not found');

        // 2. Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@zain.com',
            password: '123456'
        });
        const token = loginRes.data.token;

        // 3. Get Product
        const product = await Product.findOne({});

        // 4. Create Order Payload (mimicking CheckoutPage.tsx)
        const orderData = {
            orderItems: [{
                name: product.name,
                quantity: 10,
                image: product.imageUrl,
                price: product.pricePerMeter,
                product: product._id,
                materialType: product.materialType,
                type: 'regular',
                customization: 'Test Note',
                isRiskAccepted: false
            }],
            shippingAddress: {
                address: '123 Main St',
                city: 'Test City',
                postalCode: '10001',
                country: 'India',
                phone: '9876543210' // Ensure phone is present
            },
            paymentMethod: 'BillDesk',
            deliveryMethod: 'Courier',
            itemsPrice: product.pricePerMeter * 10,
            shippingPrice: 0,
            taxPrice: 100,
            totalPrice: (product.pricePerMeter * 10) + 100,
            isPaid: true,
            paidAt: new Date().toISOString(),
            paymentResult: {}
        };

        console.log('Sending Order Data...');
        const res = await axios.post(`${API_URL}/orders`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Order Created Successfully:', res.data._id);

    } catch (e) {
        console.error('Test Failed:', e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    } finally {
        mongoose.disconnect();
    }
};

run();
