import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../store';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    TrendingUp, TrendingDown, Package, Users, ShoppingBag, DollarSign,
    Download, RefreshCw, Award, Clock
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const DAY_OPTIONS = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '90 Days', value: '90' },
    { label: '365 Days', value: '365' },
    { label: 'All Time', value: 'all' },
];

const STATUS_COLORS: Record<string, string> = {
    Delivered: '#10b981',
    Shipped: '#8b5cf6',
    Processing: '#f59e0b',
    Ordered: '#3b82f6',
    Pending: '#f59e0b',
    Cancelled: '#ef4444',
};

const CHART_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899'];

interface Stats { totalSales: number; activeOrders: number; totalProducts: number; totalUsers: number; }
interface RevenuePoint { date: string; revenue: number; orders: number; paid: number; }
interface StatusPoint { status: string; count: number; revenue: number; }
interface ProductRow { _id: string; name: string; totalPurchases: number; totalRevenue: number; orderCount: number; uniqueCustomers: number; }
interface CustomerRow { _id: string; name: string; email: string; company: string; orderCount: number; totalSpend: number; lastOrder: string; }

const AnalyticsDashboardPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [days, setDays] = useState('30');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'customers'>('overview');

    const [stats, setStats] = useState<Stats>({ totalSales: 0, activeOrders: 0, totalProducts: 0, totalUsers: 0 });
    const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
    const [statusBreakdown, setStatusBreakdown] = useState<StatusPoint[]>([]);
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [customers, setCustomers] = useState<CustomerRow[]>([]);

    const headers = useCallback(() => ({
        headers: { Authorization: `Bearer ${user?.token}` }
    }), [user?.token]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, revenueRes, statusRes, prodRes, custRes] = await Promise.all([
                fetch(`${API}/orders/admin/stats`, headers()),
                fetch(`${API}/orders/analytics/revenue?days=${days}`, headers()),
                fetch(`${API}/orders/analytics/status?days=${days}`, headers()),
                fetch(`${API}/orders/analytics/products?days=${days}`, headers()),
                fetch(`${API}/orders/analytics/customers?days=${days}`, headers()),
            ]);
            setStats(await statsRes.json());
            setRevenue(await revenueRes.json());
            setStatusBreakdown(await statusRes.json());
            setProducts(await prodRes.json());
            setCustomers(await custRes.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [days, headers]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Export CSV helper
    const exportCSV = (data: any[], filename: string) => {
        if (!data.length) return;
        const keys = Object.keys(data[0]);
        const csv = [keys.join(','), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${filename}_${days}days.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const totalRevenue = revenue.reduce((s, r) => s + r.revenue, 0);
    const totalPaid = revenue.reduce((s, r) => s + r.paid, 0);
    const totalOrdersInPeriod = revenue.reduce((s, r) => s + r.orders, 0);
    const avgOrderValue = totalOrdersInPeriod ? Math.round(totalRevenue / totalOrdersInPeriod) : 0;

    const kpis = [
        { label: 'Period Revenue', value: `₹${totalRevenue.toLocaleString()}`, sub: `${days === 'all' ? 'All time' : `Last ${days} days`}`, icon: DollarSign, color: 'text-brand', bg: 'bg-brand/10' },
        { label: 'Paid Revenue', value: `₹${totalPaid.toLocaleString()}`, sub: `${totalRevenue ? Math.round(totalPaid / totalRevenue * 100) : 0}% of total`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Period Orders', value: totalOrdersInPeriod, sub: 'Non-cancelled', icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Avg Order Value', value: `₹${avgOrderValue.toLocaleString()}`, sub: 'Per order', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'All-Time Revenue', value: `₹${stats.totalSales?.toLocaleString() ?? 0}`, sub: 'Lifetime', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Active Orders', value: stats.activeOrders ?? 0, sub: 'Not delivered', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Products', value: stats.totalProducts ?? 0, sub: 'In catalog', icon: Package, color: 'text-brand', bg: 'bg-brand/10' },
        { label: 'Customers', value: stats.totalUsers ?? 0, sub: 'Registered', icon: Users, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            return (
                <div className="bg-secondary border border-theme rounded-xl p-4 shadow-2xl text-xs">
                    <p className="font-black text-secondary-text mb-2 uppercase tracking-wider">{label}</p>
                    {payload.map((p: any, i: number) => (
                        <p key={i} style={{ color: p.color }} className="font-bold">
                            {p.name}: {p.name.toLowerCase().includes('revenue') || p.name.toLowerCase().includes('₹') ? `₹${p.value?.toLocaleString()}` : p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="font-sans pb-12">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-theme">
                <div>
                    <h1 className="text-3xl font-black font-serif text-primary-text tracking-widest uppercase">
                        Analytics <span className="text-brand italic font-normal">Intelligence</span>
                    </h1>
                    <p className="text-secondary-text text-xs mt-1 tracking-widest uppercase">Revenue · Products · Customers</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Day filter */}
                    <div className="flex gap-1 bg-secondary border border-theme rounded-xl p-1">
                        {DAY_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setDays(opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${days === opt.value ? 'bg-brand text-black' : 'text-secondary-text hover:text-primary-text'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchAll} className="p-2.5 border border-theme rounded-xl text-secondary-text hover:text-brand hover:border-brand transition-all">
                        <RefreshCw size={15} />
                    </button>
                    <button
                        onClick={() => {
                            const tab = activeTab;
                            if (tab === 'products') exportCSV(products, 'product_report');
                            else if (tab === 'customers') exportCSV(customers, 'customer_report');
                            else exportCSV(revenue, 'revenue_report');
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-brand text-black text-[10px] font-black uppercase tracking-wider rounded-xl hover:opacity-90 transition-all"
                    >
                        <Download size={13} /> Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand" />
                </div>
            ) : (
                <>
                    {/* KPI Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {kpis.map((kpi, i) => (
                            <div key={i} className="bg-secondary border border-theme rounded-2xl p-5 hover:border-brand/40 transition-all hover:-translate-y-0.5 group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                                        <kpi.icon size={18} className={kpi.color} />
                                    </div>
                                    <TrendingUp size={13} className="text-brand opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest mb-1">{kpi.label}</p>
                                <p className="text-2xl font-black text-primary-text group-hover:text-brand transition-colors">{kpi.value}</p>
                                <p className="text-[9px] text-secondary-text mt-0.5">{kpi.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tab Nav */}
                    <div className="flex gap-1 bg-secondary border border-theme rounded-2xl p-1 mb-6 w-fit">
                        {(['overview', 'products', 'customers'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all capitalize ${activeTab === tab ? 'bg-brand text-black' : 'text-secondary-text hover:text-primary-text'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* ── OVERVIEW TAB ── */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Revenue Chart */}
                            <div className="bg-secondary border border-theme rounded-2xl p-6 shadow-xl">
                                <h3 className="text-sm font-black text-primary-text uppercase tracking-widest mb-6">Revenue Over Time</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={revenue}>
                                        <defs>
                                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
                                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'currentColor', opacity: 0.5 }} tickFormatter={d => d.slice(5)} />
                                        <YAxis tick={{ fontSize: 9, fill: 'currentColor', opacity: 0.5 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" name="Total Revenue" />
                                        <Area type="monotone" dataKey="paid" stroke="#8b5cf6" strokeWidth={2} fill="url(#paidGrad)" name="Paid Revenue" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Orders Per Day */}
                                <div className="bg-secondary border border-theme rounded-2xl p-6 shadow-xl">
                                    <h3 className="text-sm font-black text-primary-text uppercase tracking-widest mb-6">Orders Per Day</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={revenue}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
                                            <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'currentColor', opacity: 0.5 }} tickFormatter={d => d.slice(5)} />
                                            <YAxis tick={{ fontSize: 8, fill: 'currentColor', opacity: 0.5 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="Orders" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Status Donut */}
                                <div className="bg-secondary border border-theme rounded-2xl p-6 shadow-xl">
                                    <h3 className="text-sm font-black text-primary-text uppercase tracking-widest mb-4">Order Status Breakdown</h3>
                                    <div className="flex items-center gap-4">
                                        <ResponsiveContainer width="50%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={statusBreakdown}
                                                    dataKey="count"
                                                    nameKey="status"
                                                    cx="50%" cy="50%"
                                                    innerRadius={55} outerRadius={80}
                                                    paddingAngle={3}
                                                >
                                                    {statusBreakdown.map((s, i) => (
                                                        <Cell key={i} fill={STATUS_COLORS[s.status] || CHART_COLORS[i % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="flex-1 space-y-2">
                                            {statusBreakdown.map((s, i) => (
                                                <div key={i} className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[s.status] || CHART_COLORS[i % CHART_COLORS.length] }} />
                                                        <span className="text-[9px] font-black text-secondary-text uppercase tracking-wider">{s.status}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black text-primary-text">{s.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PRODUCTS TAB ── */}
                    {activeTab === 'products' && (
                        <div className="bg-secondary border border-theme rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-5 border-b border-theme flex justify-between items-center">
                                <h3 className="text-sm font-black text-primary-text uppercase tracking-widest">Product Purchase Report</h3>
                                <button onClick={() => exportCSV(products, 'product_report')} className="flex items-center gap-1.5 text-[10px] font-black text-brand hover:text-primary-text transition-colors uppercase tracking-wider">
                                    <Download size={12} /> Export
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-bg-alt text-secondary-text text-[9px] uppercase font-black tracking-widest border-b border-theme">
                                        <tr>
                                            <th className="px-5 py-3">#</th>
                                            <th className="px-5 py-3">Product</th>
                                            <th className="px-5 py-3">Units Sold</th>
                                            <th className="px-5 py-3">Orders</th>
                                            <th className="px-5 py-3">Unique Buyers</th>
                                            <th className="px-5 py-3">Revenue</th>
                                            <th className="px-5 py-3">Popularity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme text-sm">
                                        {products.length === 0 && (
                                            <tr><td colSpan={7} className="text-center py-16 text-secondary-text italic text-xs">No product data for this period.</td></tr>
                                        )}
                                        {products.map((p, i) => {
                                            const maxRev = products[0]?.totalRevenue || 1;
                                            return (
                                                <tr key={p._id} className="hover:bg-bg-alt transition-colors">
                                                    <td className="px-5 py-4 text-secondary-text font-mono text-xs">{i + 1}</td>
                                                    <td className="px-5 py-4 font-bold text-primary-text max-w-[200px]">
                                                        <p className="truncate">{p.name}</p>
                                                        {i === 0 && <span className="text-[8px] text-brand font-black uppercase tracking-wider">⭐ Top Seller</span>}
                                                    </td>
                                                    <td className="px-5 py-4 font-mono font-bold text-primary-text">{p.totalPurchases}</td>
                                                    <td className="px-5 py-4 font-mono text-secondary-text">{p.orderCount}</td>
                                                    <td className="px-5 py-4 font-mono text-secondary-text">{p.uniqueCustomers}</td>
                                                    <td className="px-5 py-4 font-black text-brand font-mono">₹{p.totalRevenue.toLocaleString()}</td>
                                                    <td className="px-5 py-4 w-32">
                                                        <div className="h-1.5 bg-bg-alt rounded-full overflow-hidden">
                                                            <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${(p.totalRevenue / maxRev) * 100}%` }} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── CUSTOMERS TAB ── */}
                    {activeTab === 'customers' && (
                        <div className="bg-secondary border border-theme rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-5 border-b border-theme flex justify-between items-center">
                                <h3 className="text-sm font-black text-primary-text uppercase tracking-widest">Customer Purchase Report</h3>
                                <button onClick={() => exportCSV(customers, 'customer_report')} className="flex items-center gap-1.5 text-[10px] font-black text-brand hover:text-primary-text transition-colors uppercase tracking-wider">
                                    <Download size={12} /> Export
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-bg-alt text-secondary-text text-[9px] uppercase font-black tracking-widest border-b border-theme">
                                        <tr>
                                            <th className="px-5 py-3">#</th>
                                            <th className="px-5 py-3">Customer</th>
                                            <th className="px-5 py-3">Orders</th>
                                            <th className="px-5 py-3">Total Spend</th>
                                            <th className="px-5 py-3">Last Order</th>
                                            <th className="px-5 py-3">Loyalty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme text-sm">
                                        {customers.length === 0 && (
                                            <tr><td colSpan={6} className="text-center py-16 text-secondary-text italic text-xs">No customer data for this period.</td></tr>
                                        )}
                                        {customers.map((c, i) => {
                                            const maxSpend = customers[0]?.totalSpend || 1;
                                            return (
                                                <tr key={c._id} className="hover:bg-bg-alt transition-colors">
                                                    <td className="px-5 py-4 text-secondary-text font-mono text-xs">{i + 1}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-bold text-primary-text">{c.name}</div>
                                                        <div className="text-[10px] text-secondary-text">{c.email}</div>
                                                        {c.company && <div className="text-[9px] text-brand">{c.company}</div>}
                                                        {i === 0 && <span className="text-[8px] text-amber-500 font-black uppercase tracking-wider">⭐ Top Customer</span>}
                                                    </td>
                                                    <td className="px-5 py-4 font-mono font-bold text-primary-text">{c.orderCount}</td>
                                                    <td className="px-5 py-4 font-black text-brand font-mono">₹{c.totalSpend.toLocaleString()}</td>
                                                    <td className="px-5 py-4 text-secondary-text text-xs">
                                                        {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="px-5 py-4 w-32">
                                                        <div className="h-1.5 bg-bg-alt rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(c.totalSpend / maxSpend) * 100}%` }} />
                                                        </div>
                                                        <p className="text-[8px] text-secondary-text mt-0.5">{c.orderCount > 3 ? '🔥 Loyal' : c.orderCount > 1 ? '↩ Repeat' : 'New'}</p>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="mt-8 flex gap-4 flex-wrap">
                        <Link to="/admin/orders" className="px-5 py-2.5 bg-secondary border border-theme rounded-xl text-xs font-black text-secondary-text hover:text-brand hover:border-brand uppercase tracking-widest transition-all flex items-center gap-2">
                            <ShoppingBag size={13} /> All Orders
                        </Link>
                        <Link to="/admin/products" className="px-5 py-2.5 bg-secondary border border-theme rounded-xl text-xs font-black text-secondary-text hover:text-brand hover:border-brand uppercase tracking-widest transition-all flex items-center gap-2">
                            <Package size={13} /> Products
                        </Link>
                        <Link to="/admin" className="px-5 py-2.5 bg-secondary border border-theme rounded-xl text-xs font-black text-secondary-text hover:text-brand hover:border-brand uppercase tracking-widest transition-all flex items-center gap-2">
                            <TrendingDown size={13} /> Dashboard
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsDashboardPage;
