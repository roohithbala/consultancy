import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import path from 'path';
import fs from 'fs';
import { generateInvoice } from '../utils/generateInvoice.js';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            billingAddress: req.body.billingAddress || shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            trackingHistory: [{
                status: 'Ordered',
                description: 'Order has been placed successfully.',
                location: 'System'
            }]
        });

        const createdOrder = await order.save();

        // Send Confirmation Email
        if (req.user && req.user.email) {
            sendEmail(
                req.user.email,
                `Order Confirmation #${createdOrder._id}`,
                `Thank you for your order! Your order ID is ${createdOrder._id}. We will notify you when it ships.`
            );
        }

        res.status(201).json(createdOrder);
    }
};

// @desc    Get verified samples for a product
// @route   GET /api/orders/samples/:productId
// @access  Private
export const getVerifiedSamples = async (req, res) => {
    const { productId } = req.params;

    // Find delivered orders that contain this product as a sample
    const orders = await Order.find({
        user: req.user._id,
        'orderItems.product': productId,
        'orderItems.type': 'sample',
        // In a real scenario, you might want to check if status is 'Delivered'
        // status: 'Delivered' 
    }).select('_id createdAt status orderItems');

    // Filter to finding the specific item within the order (optional depth)
    const validSamples = orders.map(order => ({
        _id: order._id,
        date: order.createdAt,
        status: order.status
    }));

    res.json(validSamples);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;

        // Add to tracking history
        order.trackingHistory.push({
            status: req.body.status,
            description: `Order status updated to ${req.body.status}`,
            location: 'Warehouse' // Could be dynamic in future
        });

        if (req.body.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        // Manual Invoice / Bill Number Handling
        if (req.body.invoiceNumber) {
            order.invoiceNumber = req.body.invoiceNumber;
        }
        if (req.body.manualInvoiceUrl) {
            order.manualInvoiceUrl = req.body.manualInvoiceUrl;
            order.invoiceUrl = req.body.manualInvoiceUrl; // Override main URL for easy access
            order.isManualInvoice = true;
        }

        if (req.body.status === 'Shipped' && !order.invoiceUrl) {
            const invoiceName = `invoice-${order._id}.pdf`;
            const invoicePath = path.join(process.cwd(), 'uploads', 'invoices', invoiceName);

            try {
                // Generate Invoice
                await generateInvoice(order, invoicePath);

                // Update Order with URL (assuming serving static files from /uploads)
                order.invoiceUrl = `/uploads/invoices/${invoiceName}`;
                order.invoiceDate = Date.now();

                // Send Email with Attachment
                if (order.user && order.user.email) {
                    await sendEmail(
                        order.user.email,
                        `Dispatch Notification & Invoice - Order #${order._id}`,
                        `Your order has been shipped! Please find your Tax Invoice attached.`,
                        [{ filename: invoiceName, path: invoicePath }]
                    );
                }
            } catch (err) {
                console.error("Error generating invoice:", err);
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
    try {
        // 1. Total Sales (Sum of totalPrice for paid/delivered orders - for now just all orders to keep it simple or check status)
        const orders = await Order.find({});
        const totalSales = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        // 2. Active Orders (Not Delivered)
        const activeOrdersCount = await Order.countDocuments({ status: { $ne: 'Delivered' } });

        // 3. Total Products
        const totalProductsCount = await Product.countDocuments({});

        // 4. Total Users
        const totalUsersCount = await User.countDocuments({});

        // 5. Recent Orders (Limit 5)
        const recentOrders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalSales,
            activeOrders: activeOrdersCount,
            totalProducts: totalProductsCount,
            totalUsers: totalUsersCount,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};
