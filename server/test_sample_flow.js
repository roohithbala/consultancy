import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5002/api';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // 1. Get Admin User
        const adminUser = await User.findOne({ email: 'admin@zain.com' });
        if (!adminUser) throw new Error('Admin not found');
        console.log('Admin ID:', adminUser._id);

        // 2. Logging in
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@zain.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log('Login successful.');

        // 3. Get a Product
        const product = await Product.findOne({});
        console.log('Testing with Product:', product.name, product._id);

        // 4. Create a Sample Order
        console.log('Creating Sample Order...');
        const orderRes = await axios.post(`${API_URL}/orders`, {
            orderItems: [{
                product: product._id,
                name: product.name,
                image: product.imageUrl,
                price: product.samplePrice || 0,
                quantity: 1,
                product: product._id,
                type: 'sample'
            }],
            shippingAddress: { address: 'Test', city: 'Test', postalCode: '123', country: 'Test', phone: '1234567890' },
            paymentMethod: 'BillDesk',
            itemsPrice: product.samplePrice || 0,
            shippingPrice: 0,
            taxPrice: 0,
            totalPrice: product.samplePrice || 0
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Order Created:', orderRes.data._id);

        // 5. Fetch Verified Samples
        console.log('Fetching Verified Samples...');
        const samplesRes = await axios.get(`${API_URL}/orders/samples/${product._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Authorized Samples found:', samplesRes.data);

    } catch (e) {
        console.error('Error:', e.response ? e.response.data : e.message);
    } finally {
        mongoose.disconnect();
    }
};

run();
