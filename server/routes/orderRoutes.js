import express from 'express';
import {
    addOrderItems,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    getVerifiedSamples,
    getAdminStats,
    cancelOrder,
    updateRefundStatus,
    updateOrderFinancials,
    updatePaymentStatus,
    getRevenueByDay,
    getStatusBreakdown,
    getProductReport,
    getCustomerReport,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/myorders').get(protect, getMyOrders);
router.route('/admin/stats').get(protect, admin, getAdminStats);
router.route('/samples/:productId').get(protect, getVerifiedSamples);

// Analytics routes
router.route('/analytics/revenue').get(protect, admin, getRevenueByDay);
router.route('/analytics/status').get(protect, admin, getStatusBreakdown);
router.route('/analytics/products').get(protect, admin, getProductReport);
router.route('/analytics/customers').get(protect, admin, getCustomerReport);

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/refund').put(protect, admin, updateRefundStatus);
router.route('/:id/financials').put(protect, admin, updateOrderFinancials);
router.route('/:id/payment').put(protect, admin, updatePaymentStatus);

export default router;
