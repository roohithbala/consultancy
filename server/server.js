import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zain-fabrics')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
    res.send('Zain Fabrics API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
