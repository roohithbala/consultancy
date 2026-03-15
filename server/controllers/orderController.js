import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import path from 'path';
import fs from 'fs';
import { generateInvoice } from '../utils/generateInvoice.js';
import { uploadToMega } from '../utils/megaStorage.js';
import { sendEmail, getOrderConfirmationHtml, getOrderShippedHtml, getOrderCancelledHtml, getRefundUpdateHtml, getOrderOutHtml, getOrderDeliveredHtml, getOrderStatusUpdateHtml } from '../utils/sendEmail.js';

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
        isPaid,
        paidAt,
        paymentResult,
        deliveryMethod,
        isCredit,
        creditTermsDays,
        creditDueDate,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        try {
            const order = new Order({
                orderItems,
                user: req.user._id,
                shippingAddress,
                billingAddress: req.body.billingAddress || shippingAddress,
                paymentMethod,
                deliveryMethod: deliveryMethod || 'Courier',
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                isPaid: isPaid || false,
                paidAt: paidAt || undefined,
                paymentResult: paymentResult || {},
                isCredit: isCredit || false,
                creditTermsDays: creditTermsDays || 0,
                creditDueDate: creditDueDate || undefined,
                trackingHistory: [{
                    status: 'Ordered',
                    description: 'Order has been placed successfully.',
                    location: 'System'
                }]
            });

            const createdOrder = await order.save();

            // Send Confirmation Email
            if (req.user && req.user.email) {
                // Don't await email, let it happen in background
                sendEmail(
                    req.user.email,
                    `Order Confirmation #${createdOrder._id}`,
                    `Thank you for your order! Your order ID is ${createdOrder._id}. We will notify you when it ships.`,
                    [],
                    getOrderConfirmationHtml(req.user.name, createdOrder._id, createdOrder.totalPrice)
                ).catch(err => console.error("Email failed:", err));
            }

            res.status(201).json(createdOrder);
        } catch (error) {
            console.error("Create Order Error:", error);
            res.status(400).json({ message: 'Invalid order data', error: error.message });
        }
    }
};

// @desc    Get verified samples for a product
// @route   GET /api/orders/samples/:productId
// @access  Private
export const getVerifiedSamples = async (req, res) => {
    const { productId } = req.params;

    try {
        // Find delivered orders that contain this product as a sample
        const orders = await Order.find({
            user: req.user._id,
            'orderItems.product': productId,
            'orderItems.type': 'sample',
            status: 'Delivered' // Enforce verification (delivery)
        })
            .select('_id createdAt status')
            .sort({ createdAt: -1 });

        const validSamples = orders.map(order => ({
            _id: order._id,
            date: order.createdAt,
            status: order.status
        }));

        res.json(validSamples);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching samples', error: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone companyName gstNo');

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

// @desc    Get all orders with optional filtering
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
    try {
        const { status, paymentMethod, startDate, endDate, keyword } = req.query;
        let query = {};

        if (status && status !== 'All') {
            query.status = status;
        }

        if (paymentMethod && paymentMethod !== 'All') {
            query.paymentMethod = paymentMethod;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        if (keyword) {
            const isObjectId = mongoose.Types.ObjectId.isValid(keyword);
            query.$or = [
                isObjectId ? { _id: keyword } : null,
                { trackingNumber: { $regex: keyword, $options: 'i' } },
                { courierName: { $regex: keyword, $options: 'i' } },
                { 'shippingAddress.address': { $regex: keyword, $options: 'i' } },
                { 'shippingAddress.phone': { $regex: keyword, $options: 'i' } }
            ].filter(Boolean);

            // Also search by user name/email if keyword is string
            const users = await User.find({
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { companyName: { $regex: keyword, $options: 'i' } }
                ]
            }).select('_id');
            
            if (users.length > 0) {
                query.$or.push({ user: { $in: users.map(u => u._id) } });
            }
        }

        const orders = await Order.find(query)
            .populate('user', 'name email phone companyName')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const newStatus = req.body.status;
    const currentStatus = order.status;

    // Strict Status Flow Definition - Treat 'Pending' as 'Ordered' for logic
    const statusFlow = ['Ordered', 'Processing', 'Shipped', 'Out', 'Delivered'];
    
    // Normalize current status for flow logic
    const effectiveCurrentStatus = (currentStatus === 'Pending') ? 'Ordered' : currentStatus;
    
    const currentIndex = statusFlow.indexOf(effectiveCurrentStatus);
    const nextIndex = statusFlow.indexOf(newStatus);

    if (newStatus && newStatus !== currentStatus && newStatus !== 'Cancelled') {
        // Enforce sequential flow
        if (nextIndex === -1) {
            return res.status(400).json({ message: `Invalid status: ${newStatus}` });
        }
        if (nextIndex !== currentIndex + 1) {
            return res.status(400).json({ message: `Invalid status jump. Order must follow: ${statusFlow.join(' -> ')}` });
        }
    }

    if (order) {
        order.status = req.body.status || order.status;

        // Add to tracking history
        if (req.body.status && req.body.status !== currentStatus) {
            order.trackingHistory.push({
                status: req.body.status,
                description: `Order status updated to ${req.body.status}`,
                location: 'Warehouse'
            });
        }

        if (req.body.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        if (req.body.invoiceNumber) order.invoiceNumber = req.body.invoiceNumber;
        if (req.body.manualInvoiceUrl) {
            order.manualInvoiceUrl = req.body.manualInvoiceUrl;
            order.invoiceUrl = req.body.manualInvoiceUrl;
            order.isManualInvoice = true;
        }

        if (req.body.trackingInfo) {
            order.trackingNumber = req.body.trackingInfo;
            if (req.body.courierName) order.courierName = req.body.courierName;
            order.trackingHistory.push({
                status: 'Tracking Updated',
                description: `Tracking number added: ${req.body.trackingInfo}${req.body.courierName ? ' via ' + req.body.courierName : ''}`,
                location: 'Admin Update'
            });
        }

        if (req.body.status === 'Shipped' && !order.invoiceUrl) {
            const invoiceName = `invoice-${order._id}.pdf`;
            const invoicePath = path.join(process.cwd(), 'uploads', 'invoices', invoiceName);
            try {
                await generateInvoice(order, invoicePath);
                
                // Upload to MEGA
                console.log('Uploading invoice to MEGA...');
                const megaLink = await uploadToMega(invoicePath);
                console.log('Invoice uploaded to MEGA:', megaLink);
                
                order.invoiceUrl = megaLink;
                order.invoiceDate = Date.now();
                
                if (order.user && order.user.email) {
                    await sendEmail(
                        order.user.email,
                        `Dispatch Notification & Invoice - Order #${order._id}`,
                        `Your order has been shipped! Please find your Tax Invoice at: ${megaLink}`,
                        [{ filename: invoiceName, path: invoicePath }], // Still send as attachment
                        getOrderShippedHtml(order.user.name, order._id, order.trackingNumber || 'En route')
                    );
                }
                
                // Clean up local file after upload
                fs.unlink(invoicePath, (err) => {
                    if (err) console.error('Error deleting local invoice path:', err);
                });
            } catch (err) {
                console.error("Error generating invoice:", err);
            }
        }

        const updatedOrder = await order.save();
        const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'name email');

        // Status change emails
        if (populatedOrder.user && populatedOrder.user.email) {
            const userEmail = populatedOrder.user.email;
            const userName = populatedOrder.user.name || 'Valued Customer';
            const status = req.body.status;

            try {
                if (status === 'Delivered') {
                    await sendEmail(userEmail, `Order Delivered - #${populatedOrder._id}`, `Your order #${populatedOrder._id} has been delivered successfully.`, [], getOrderDeliveredHtml(userName, populatedOrder._id));
                } else if (status === 'Out') {
                    await sendEmail(userEmail, `Out for Delivery - #${populatedOrder._id}`, `Your order #${populatedOrder._id} is out for delivery!`, [], getOrderOutHtml(userName, populatedOrder._id));
                } else if (status === 'Shipped' && (req.body.manualInvoiceUrl || !populatedOrder.invoiceUrl)) {
                    await sendEmail(userEmail, `Dispatch Notification - Order #${populatedOrder._id}`, `Your order #${populatedOrder._id} has been shipped!`, [], getOrderShippedHtml(userName, populatedOrder._id, populatedOrder.trackingNumber || 'En route'));
                } else if (status && status !== 'Shipped' && status !== 'Ordered' && status !== currentStatus) {
                    await sendEmail(userEmail, `Order Status Update: ${status} - #${populatedOrder._id}`, `Your order #${populatedOrder._id} status is now: ${status}`, [], getOrderStatusUpdateHtml(userName, populatedOrder._id, status, `Your order has been updated to ${status}.`));
                }

                if (req.body.trackingInfo && status !== 'Shipped' && status !== 'Delivered' && status !== 'Out') {
                   await sendEmail(userEmail, `Tracking Information Updated - #${populatedOrder._id}`, `Tracking info added for order #${populatedOrder._id}: ${req.body.trackingInfo}`, [], getOrderStatusUpdateHtml(userName, populatedOrder._id, populatedOrder.status, `Tracking information has been updated: ${req.body.trackingInfo}${req.body.courierName ? ' via ' + req.body.courierName : ''}`));
                }
            } catch (err) {
                console.error("Status email failed:", err);
            }
        }
        res.json(populatedOrder);
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

        console.log("Admin Stats Debug:");
        console.log("Total Orders Found:", orders.length);
        console.log("Recent Orders Found:", recentOrders.length);
        if (recentOrders.length > 0) {
            console.log("First Recent Order:", JSON.stringify(recentOrders[0], null, 2));
        }

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

// @desc    Cancel Order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Check if user is owner or admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to cancel this order');
        }

        const isAdmin = req.user.role === 'admin';

        // Customers can only cancel when order is still in 'Ordered' status
        if (!isAdmin && order.status !== 'Ordered') {
            res.status(400);
            return res.json({ message: `Cannot cancel order in '${order.status}' status. Cancellation is only allowed before processing begins.` });
        }

        // Admins can cancel anything up to (not including) Shipped / Delivered
        if (isAdmin && ['Shipped', 'Out', 'Delivered'].includes(order.status)) {
            res.status(400);
            return res.json({ message: 'Cannot cancel order that has already been shipped or delivered. Please raise a return instead.' });
        }

        order.status = 'Cancelled';
        order.cancellationReason = req.body.reason || 'User cancelled';

        // If payment was made, request refund
        if (order.isPaid) {
            order.refundStatus = 'Requested';
            order.refundAmount = order.totalPrice;
        }

        const updatedOrder = await order.save();

        // Email Notification
        if (req.user.email) {
            sendEmail(
                req.user.email,
                `Order Cancelled - #${order._id}`,
                `Your order #${order._id} has been cancelled.${order.isPaid ? ' A refund has been requested.' : ''}`,
                [],
                getOrderCancelledHtml(req.user.name, order._id, order.cancellationReason)
            );
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update Refund Status (Admin)
// @route   PUT /api/orders/:id/refund
// @access  Private/Admin
export const updateRefundStatus = async (req, res) => {
    const { refundStatus, refundAmount } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.refundStatus = refundStatus;
        if (refundAmount) {
            order.refundAmount = refundAmount;
        }
        if (refundStatus === 'Processed') {
            order.refundDate = Date.now();
        }

        const updatedOrder = await order.save();

        if (order.user) {
            const user = await User.findById(order.user);
            if (user) {
                sendEmail(
                    user.email,
                    `Refund Status Update - Order #${order._id}`,
                    `Your refund status for order #${order._id} is now: ${refundStatus}.`,
                    [],
                    getRefundUpdateHtml(user.name, order._id, refundStatus)
                );
            }
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update Order Financials (Admin)
// @route   PUT /api/orders/:id/financials
// @access  Private/Admin
export const updateOrderFinancials = async (req, res) => {
    const { orderItems, shippingPrice } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        // Update Order Items Price
        if (orderItems && orderItems.length > 0) {
            order.orderItems.forEach(item => {
                const updatedItem = orderItems.find(i => i._id.toString() === item._id.toString());
                if (updatedItem) {
                    item.price = Number(updatedItem.price);
                }
            });
        }

        // Update Shipping
        if (shippingPrice !== undefined) {
            order.shippingPrice = Number(shippingPrice);
        }

        // Recalculate Totals
        order.itemsPrice = order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        // 18% Tax (Standard) - Re-calculate tax based on new item prices
        order.taxPrice = order.itemsPrice * 0.18;

        // Total
        order.totalPrice = Math.round(order.itemsPrice + order.taxPrice + order.shippingPrice);

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Update Payment Status (Admin)
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
export const updatePaymentStatus = async (req, res) => {
    const { isPaid } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = isPaid;
        if (isPaid) {
            order.status = 'Processing';
            if (!order.paidAt) order.paidAt = Date.now();
            if (order.paymentResult) {
                order.paymentResult.status = 'COMPLETED';
            }
        }
        if (!isPaid) {
            order.paidAt = undefined;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// ── Analytics Helpers ──────────────────────────────────────────────────────

const getDaysFilter = (days) => {
    if (!days || days === 'all') return {};
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));
    return { createdAt: { $gte: since } };
};

// @desc    Get daily revenue chart data
// @route   GET /api/orders/analytics/revenue?days=30
// @access  Private/Admin
export const getRevenueByDay = async (req, res) => {
    try {
        const { days = '30' } = req.query;
        const dateFilter = getDaysFilter(days);

        const orders = await Order.find(dateFilter).select('totalPrice createdAt status isPaid');

        // Group by date
        const revenueMap = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            if (!revenueMap[date]) revenueMap[date] = { date, revenue: 0, orders: 0, paid: 0 };
            revenueMap[date].revenue += order.totalPrice || 0;
            revenueMap[date].orders += 1;
            if (order.isPaid) revenueMap[date].paid += order.totalPrice || 0;
        });

        const result = Object.values(revenueMap).sort((a, b) => a.date.localeCompare(b.date));
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get order status breakdown
// @route   GET /api/orders/analytics/status?days=30
// @access  Private/Admin
export const getStatusBreakdown = async (req, res) => {
    try {
        const { days = 'all' } = req.query;
        const dateFilter = getDaysFilter(days);

        const breakdown = await Order.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$status', count: { $sum: 1 }, totalRevenue: { $sum: '$totalPrice' } } },
            { $sort: { count: -1 } }
        ]);

        res.json(breakdown.map(b => ({ status: b._id, count: b.count, revenue: b.totalRevenue })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get product purchase frequency report
// @route   GET /api/orders/analytics/products?days=30
// @access  Private/Admin
export const getProductReport = async (req, res) => {
    try {
        const { days = 'all' } = req.query;
        const dateFilter = getDaysFilter(days);

        const result = await Order.aggregate([
            { $match: { ...dateFilter, status: { $ne: 'Cancelled' } } },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.product',
                    name: { $first: '$orderItems.name' },
                    totalPurchases: { $sum: '$orderItems.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
                    uniqueCustomers: { $addToSet: '$user' },
                    orderCount: { $sum: 1 },
                }
            },
            {
                $project: {
                    name: 1,
                    totalPurchases: 1,
                    totalRevenue: 1,
                    orderCount: 1,
                    uniqueCustomers: { $size: '$uniqueCustomers' },
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 20 }
        ]);

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get customer purchase frequency report
// @route   GET /api/orders/analytics/customers?days=30
// @access  Private/Admin
export const getCustomerReport = async (req, res) => {
    try {
        const { days = 'all' } = req.query;
        const dateFilter = getDaysFilter(days);

        const result = await Order.aggregate([
            { $match: { ...dateFilter, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: '$user',
                    orderCount: { $sum: 1 },
                    totalSpend: { $sum: '$totalPrice' },
                    lastOrder: { $max: '$createdAt' },
                    statuses: { $addToSet: '$status' },
                }
            },
            { $sort: { totalSpend: -1 } },
            { $limit: 20 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo',
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: { $ifNull: ['$userInfo.name', 'Guest'] },
                    email: { $ifNull: ['$userInfo.email', ''] },
                    company: { $ifNull: ['$userInfo.companyName', ''] },
                    orderCount: 1,
                    totalSpend: 1,
                    lastOrder: 1,
                }
            }
        ]);

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

