import express from 'express';
import {
    getBillingSummary,
    getInvoiceList,
    getAgingReport,
    getGSTReport,
    getCreditCustomers,
    updateCustomerCredit,
    getExpenses,
    createExpense,
    deleteExpense,
    getBillingCustomers,
} from '../controllers/billingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require admin
router.use(protect, admin);

router.get('/summary',          getBillingSummary);
router.get('/invoices',         getInvoiceList);
router.get('/aging',            getAgingReport);
router.get('/gst',              getGSTReport);
router.get('/customers',        getBillingCustomers);
router.get('/credit-customers', getCreditCustomers);
router.put('/credit-customers/:id', updateCustomerCredit);
router.route('/expenses')
    .get(getExpenses)
    .post(createExpense);
router.delete('/expenses/:id',  deleteExpense);

export default router;
