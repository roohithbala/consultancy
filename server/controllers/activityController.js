import asyncHandler from 'express-async-handler';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

// @desc    Log a generic client-side event (e.g., 3D Interaction)
// @route   POST /api/activity/log
// @access  Public
export const createLog = asyncHandler(async (req, res) => {
    const { action, details } = req.body;

    const log = await ActivityLog.create({
        user: req.user ? req.user._id : null,
        action,
        details,
        ip: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'],
        path: '/client-event',
        method: 'POST'
    });

    res.status(201).json(log);
});

// @desc    Get all activity logs with filtering
// @route   GET /api/activity
// @access  Private/Admin
export const getLogs = asyncHandler(async (req, res) => {
    const pageSize = 50;
    const page = Number(req.query.pageNumber) || 1;

    const query = {};

    // 1. Keyword search (Action, Details, Path, IP)
    if (req.query.keyword) {
        query.$or = [
            { action: { $regex: req.query.keyword, $options: 'i' } },
            { path: { $regex: req.query.keyword, $options: 'i' } },
            { ip: { $regex: req.query.keyword, $options: 'i' } },
            { 'details.productName': { $regex: req.query.keyword, $options: 'i' } },
            { 'details.type': { $regex: req.query.keyword, $options: 'i' } }
        ];
    }

    // 2. Filter by User
    if (req.query.user) {
        query.user = req.query.user;
    }

    // 3. Filter by Action Type
    if (req.query.actionType) {
        query.action = req.query.actionType;
    }

    // 4. Filter by Method
    if (req.query.method) {
        query.method = req.query.method;
    }

    // 5. Filter by Path (Exact match if keyword not used)
    if (req.query.path) {
        query.path = { $regex: req.query.path, $options: 'i' };
    }

    // 6. Filter by IP
    if (req.query.ip) {
        query.ip = req.query.ip;
    }

    // 7. Date Range Filter
    if (req.query.startDate || req.query.endDate) {
        query.createdAt = {};
        if (req.query.startDate) {
            query.createdAt.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            const end = new Date(req.query.endDate);
            end.setHours(23, 59, 59, 999);
            query.createdAt.$lte = end;
        }
    }

    const count = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ logs, page, pages: Math.ceil(count / pageSize), totalLogs: count });
});

// @desc    Get activity statistics
// @route   GET /api/activity/stats
// @access  Private/Admin
export const getActivityStats = asyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Total interactions (30 days)
    const totalInteractions = await ActivityLog.countDocuments({ 
        createdAt: { $gte: thirtyDaysAgo } 
    });

    // 2. 3D Model Interactions count
    const threeDInteractions = await ActivityLog.countDocuments({ 
        action: '3D_MODEL_INTERACTION',
        createdAt: { $gte: thirtyDaysAgo }
    });

    // 3. Top Active Users
    const topUsers = await ActivityLog.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, user: { $exists: true, $ne: null } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        { $unwind: '$userInfo' },
        {
            $project: {
                name: '$userInfo.name',
                email: '$userInfo.email',
                count: 1
            }
        }
    ]);

    // 4. Most Viewed Products (via 3D interaction or PRODUCT_VIEW)
    const topProducts = await ActivityLog.aggregate([
        { 
            $match: { 
                action: { $in: ['3D_MODEL_INTERACTION', 'PRODUCT_VIEW'] },
                'details.productName': { $exists: true }
            } 
        },
        { $group: { _id: '$details.productName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    // 5. Activity Timeline (Daily)
    const timeline = await ActivityLog.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 },
                threeD: { 
                    $sum: { $cond: [{ $eq: ['$action', '3D_MODEL_INTERACTION'] }, 1, 0] } 
                }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({
        totalInteractions,
        threeDInteractions,
        topUsers,
        topProducts,
        timeline
    });
});
