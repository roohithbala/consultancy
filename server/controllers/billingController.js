import Order from '../models/Order.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';

// ── Helper ────────────────────────────────────────────────────────────────────

const buildDateFilter = (from, to, days) => {
    if (from && to) return { createdAt: { $gte: new Date(from), $lte: new Date(to + 'T23:59:59') } };
    if (!days || days === 'all') return {};
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));
    return { createdAt: { $gte: since } };
};

// Merge date filter with optional customer filter
const buildFilter = (from, to, days, customerId) => {
    const filter = buildDateFilter(from, to, days);
    if (customerId && customerId !== 'all') filter.user = customerId;
    return filter;
};

// ── Customer List (for filter dropdown) ──────────────────────────────────────
// GET /api/billing/customers
export const getBillingCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' })
            .select('name email companyName')
            .sort({ name: 1 })
            .lean();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Billing KPI Summary ──────────────────────────────────────────────────────
// GET /api/billing/summary?days=30&customerId=xxx
export const getBillingSummary = async (req, res) => {
    try {
        const { days = 'all', from, to, customerId } = req.query;
        const filter = buildFilter(from, to, days, customerId);
        const now = new Date();

        const orders = await Order.find(filter)
            .populate('user', 'creditTermsDays creditEnabled name')
            .lean();

        let totalBilled = 0, totalCollected = 0, totalOutstanding = 0;
        let overdueCount = 0, overdueAmount = 0;

        for (const order of orders) {
            totalBilled += order.totalPrice || 0;
            if (order.isPaid || order.status === 'Delivered') {
                totalCollected += order.totalPrice || 0;
            } else {
                totalOutstanding += order.totalPrice || 0;
                const creditDays = order.user?.creditTermsDays || 0;
                const dueDate = new Date(order.createdAt);
                dueDate.setDate(dueDate.getDate() + creditDays);
                if (dueDate < now && !order.isPaid) {
                    overdueCount++;
                    overdueAmount += order.totalPrice || 0;
                }
            }
        }

        const totalTax = orders.reduce((s, o) => s + (o.taxPrice || 0), 0);
        const totalShipping = orders.reduce((s, o) => s + (o.shippingPrice || 0), 0);

        // Expenses are not customer-specific; skip filter for expenses when customerId set
        const expFilter = customerId && customerId !== 'all' ? {} :
            buildDateFilter(from, to, days);
        const expenses = await Expense.find(expFilter);
        const totalExpenses = customerId && customerId !== 'all' ? 0 :
            expenses.reduce((s, e) => s + e.amount, 0);

        res.json({
            totalBilled,
            totalCollected,
            totalOutstanding,
            totalTax,
            totalShipping,
            totalExpenses,
            netProfit: totalCollected - totalExpenses,
            overdueCount,
            overdueAmount,
            totalOrders: orders.length,
            paidOrders: orders.filter(o => o.isPaid).length,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Invoice List (with filters) ──────────────────────────────────────────────
// GET /api/billing/invoices?status=all|paid|pending|overdue&days=30&customerId=xxx
export const getInvoiceList = async (req, res) => {
    try {
        const { status = 'all', days = 'all', from, to, limit = 200, customerId } = req.query;
        const filter = buildFilter(from, to, days, customerId);
        const now = new Date();

        const orders = await Order.find(filter)
            .populate('user', 'name email companyName creditTermsDays creditEnabled creditLimit')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        const invoices = orders.map(order => {
            const creditDays = order.creditTermsDays || order.user?.creditTermsDays || 0;
            const dueDate = order.creditDueDate
                ? new Date(order.creditDueDate)
                : (() => { const d = new Date(order.createdAt); d.setDate(d.getDate() + creditDays); return d; })();
            const daysOverdue = order.isPaid ? 0 : Math.max(0, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)));

            let payStatus = 'Pending';
            if (order.isPaid) payStatus = 'Paid';
            else if (daysOverdue > 0) payStatus = 'Overdue';

            return {
                _id: order._id,
                orderStatus: order.status,
                payStatus,
                paymentMethod: order.paymentMethod,
                isCredit: order.isCredit || false,
                customerName: order.user?.name || 'Guest',
                customerEmail: order.user?.email || '',
                companyName: order.user?.companyName || '',
                itemsPrice: order.itemsPrice,
                taxPrice: order.taxPrice,
                shippingPrice: order.shippingPrice,
                totalPrice: order.totalPrice,
                isPaid: order.isPaid,
                paidAt: order.paidAt,
                createdAt: order.createdAt,
                dueDate,
                daysOverdue,
                creditTermsDays: creditDays,
                invoiceUrl: order.invoiceUrl,
            };
        });

        let filtered = invoices;
        if (status === 'paid') filtered = invoices.filter(i => i.isPaid);
        else if (status === 'pending') filtered = invoices.filter(i => !i.isPaid && i.daysOverdue === 0);
        else if (status === 'overdue') filtered = invoices.filter(i => i.daysOverdue > 0);

        res.json(filtered);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Aging Report ─────────────────────────────────────────────────────────────
// GET /api/billing/aging?customerId=xxx
export const getAgingReport = async (req, res) => {
    try {
        const { customerId } = req.query;
        const now = new Date();
        const agingFilter = { isPaid: false, status: { $nin: ['Cancelled'] } };
        if (customerId && customerId !== 'all') agingFilter.user = customerId;

        const unpaidOrders = await Order.find(agingFilter)
            .populate('user', 'name email companyName creditTermsDays creditEnabled')
            .lean();

        const buckets = {
            'Current': { label: 'Current (Not Due)', orders: [], total: 0 },
            '1-30': { label: '1–30 Days', orders: [], total: 0 },
            '31-60': { label: '31–60 Days', orders: [], total: 0 },
            '61-90': { label: '61–90 Days', orders: [], total: 0 },
            '90+': { label: '90+ Days', orders: [], total: 0 },
        };

        for (const order of unpaidOrders) {
            const creditDays = order.creditTermsDays || order.user?.creditTermsDays || 0;
            const dueDate = order.creditDueDate
                ? new Date(order.creditDueDate)
                : (() => { const d = new Date(order.createdAt); d.setDate(d.getDate() + creditDays); return d; })();
            const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

            const entry = {
                orderId: order._id,
                customer: order.user?.name || 'Guest',
                company: order.user?.companyName || '',
                amount: order.totalPrice,
                daysOverdue: Math.max(0, daysOverdue),
                dueDate,
                creditTermsDays: creditDays,
            };

            if (daysOverdue <= 0) { buckets['Current'].orders.push(entry); buckets['Current'].total += order.totalPrice; }
            else if (daysOverdue <= 30) { buckets['1-30'].orders.push(entry); buckets['1-30'].total += order.totalPrice; }
            else if (daysOverdue <= 60) { buckets['31-60'].orders.push(entry); buckets['31-60'].total += order.totalPrice; }
            else if (daysOverdue <= 90) { buckets['61-90'].orders.push(entry); buckets['61-90'].total += order.totalPrice; }
            else { buckets['90+'].orders.push(entry); buckets['90+'].total += order.totalPrice; }
        }

        res.json(Object.entries(buckets).map(([key, b]) => ({
            bucket: key,
            label: b.label,
            count: b.orders.length,
            total: b.total,
            orders: b.orders,
        })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── GST / Tax Report ─────────────────────────────────────────────────────────
// GET /api/billing/gst?days=30&customerId=xxx
export const getGSTReport = async (req, res) => {
    try {
        const { days = '30', from, to, customerId } = req.query;
        const filter = { ...buildFilter(from, to, days, customerId), isPaid: true };

        const orders = await Order.find(filter)
            .populate('user', 'name email companyName gstNo')
            .lean();

        const monthly = {};
        orders.forEach(order => {
            const month = new Date(order.createdAt).toISOString().slice(0, 7);
            if (!monthly[month]) monthly[month] = { month, taxableAmount: 0, cgst: 0, sgst: 0, total: 0, invoiceCount: 0 };
            const taxable = order.itemsPrice || 0;
            const tax = order.taxPrice || 0;
            monthly[month].taxableAmount += taxable;
            monthly[month].cgst += tax / 2;
            monthly[month].sgst += tax / 2;
            monthly[month].total += tax;
            monthly[month].invoiceCount += 1;
        });

        const totalTax = orders.reduce((s, o) => s + (o.taxPrice || 0), 0);
        const totalTaxable = orders.reduce((s, o) => s + (o.itemsPrice || 0), 0);

        res.json({
            summary: { totalTaxable, totalCGST: totalTax / 2, totalSGST: totalTax / 2, totalGST: totalTax },
            monthly: Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)),
            orders: orders.map(o => ({
                orderId: o._id,
                customer: o.user?.name || 'Guest',
                company: o.user?.companyName || '',
                gstNo: o.user?.gstNo || '—',
                taxable: o.itemsPrice,
                cgst: (o.taxPrice || 0) / 2,
                sgst: (o.taxPrice || 0) / 2,
                total: o.taxPrice,
                date: o.createdAt,
            })).slice(0, 100)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Credit Management ─────────────────────────────────────────────────────────
// GET /api/billing/credit-customers
export const getCreditCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' })
            .select('name email companyName creditEnabled creditTermsDays creditLimit creditNotes')
            .lean();

        const orders = await Order.find({ isPaid: false, status: { $nin: ['Cancelled'] } }).lean();
        const now = new Date();

        const result = customers.map(c => {
            const customerOrders = orders.filter(o => o.user?.toString() === c._id.toString());
            const outstanding = customerOrders.reduce((s, o) => s + o.totalPrice, 0);
            const overdueOrders = customerOrders.filter(o => {
                const due = new Date(o.creditDueDate || o.createdAt);
                if (!o.creditDueDate) due.setDate(due.getDate() + (c.creditTermsDays || 0));
                return due < now;
            });
            return {
                ...c,
                outstanding,
                overdueAmount: overdueOrders.reduce((s, o) => s + o.totalPrice, 0),
                overdueCount: overdueOrders.length,
                utilizationPct: c.creditLimit > 0 ? Math.round((outstanding / c.creditLimit) * 100) : 0,
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/billing/credit-customers/:id
export const updateCustomerCredit = async (req, res) => {
    try {
        const { creditEnabled, creditTermsDays, creditLimit, creditNotes } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { creditEnabled, creditTermsDays, creditLimit, creditNotes },
            { new: true, select: 'name email companyName creditEnabled creditTermsDays creditLimit creditNotes' }
        );
        if (!user) return res.status(404).json({ message: 'Customer not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Expenses ──────────────────────────────────────────────────────────────────
// GET /api/billing/expenses?days=30
export const getExpenses = async (req, res) => {
    try {
        const { days = '30', from, to } = req.query;
        const expenses = await Expense.find(
            from && to ? { date: { $gte: new Date(from), $lte: new Date(to + 'T23:59:59') } }
                : days === 'all' ? {} : (() => { const s = new Date(); s.setDate(s.getDate() - parseInt(days)); return { date: { $gte: s } }; })()
        ).sort({ date: -1 }).lean();

        const byCategory = {};
        expenses.forEach(e => {
            if (!byCategory[e.category]) byCategory[e.category] = 0;
            byCategory[e.category] += e.amount;
        });

        res.json({ expenses, byCategory, total: expenses.reduce((s, e) => s + e.amount, 0) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/billing/expenses
export const createExpense = async (req, res) => {
    try {
        const expense = await Expense.create({ ...req.body, createdBy: req.user._id });
        res.status(201).json(expense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE /api/billing/expenses/:id
export const deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
