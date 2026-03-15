import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';

// Fix for MongoDB Atlas DNS SRV resolution issues in some environments
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://consultancy-orpin-seven.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Health Check for Render
app.get('/health', (req, res) => res.status(200).send('OK'));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zain-fabrics';
console.log(`Attempting to connect to MongoDB...`);

mongoose.connect(MONGODB_URI)
    .then(() => {
        const dbName = mongoose.connection.name;
        const host = mongoose.connection.host;
        console.log(`✅ MongoDB Connected successfully to ${dbName} on ${host}`);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        if (err.message.includes('ECONNREFUSED')) {
            console.error('Tip: Check your IP whitelisting in MongoDB Atlas and local firewall settings.');
        }
    });

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import billingRoutes from './routes/billingRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/billing', billingRoutes);

app.get('/', (req, res) => {
    res.send('Zain Fabrics API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
