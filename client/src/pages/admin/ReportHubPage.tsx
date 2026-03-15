import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../store';
import { 
    Download, FileText, ShoppingBag, Users, Package, 
    Calendar, ChevronRight, BarChart2, ShieldCheck, 
    RefreshCw, Filter
} from 'lucide-react';
import { API } from '../../config/api';

const ReportHubPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [status, setStatus] = useState('All');

    const headers = { Authorization: `Bearer ${user?.token}` };

    const handleExport = async (type: 'orders' | 'customers' | 'products' | 'billing') => {
        setLoading(type);
        try {
            let endpoint = '';
            let filename = '';
            
            const params = new URLSearchParams();
            if (dateRange.from) params.append('startDate', dateRange.from);
            if (dateRange.to) params.append('endDate', dateRange.to);
            if (status !== 'All') params.append('status', status);

            switch (type) {
                case 'orders':
                    endpoint = `${API}/orders?${params.toString()}`;
                    filename = `orders_report_${new Date().toISOString().split('T')[0]}.csv`;
                    break;
                case 'customers':
                    endpoint = `${API}/orders/analytics/customers?days=all`;
                    filename = `customer_report_${new Date().toISOString().split('T')[0]}.csv`;
                    break;
                case 'products':
                    endpoint = `${API}/orders/analytics/products?days=all`;
                    filename = `product_report_${new Date().toISOString().split('T')[0]}.csv`;
                    break;
                case 'billing':
                    endpoint = `${API}/billing/invoices?${params.toString()}`;
                    filename = `billing_report_${new Date().toISOString().split('T')[0]}.csv`;
                    break;
            }

            const res = await fetch(endpoint, { headers });
            const data = await res.json();
            
            if (Array.isArray(data) || (data && typeof data === 'object')) {
                const finalData = Array.isArray(data) ? data : (data.orders || data.expenses || [data]);
                if (finalData.length === 0) {
                    alert('No data found for the selected period.');
                    setLoading(null);
                    return;
                }
                
                const keys = Object.keys(finalData[0]);
                const csvContent = [
                    keys.join(','),
                    ...finalData.map((row: any) => 
                        keys.map(k => JSON.stringify(row[k] ?? '')).join(',')
                    )
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.click();
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate report.');
        }
        setLoading(null);
    };

    const reportCards = [
        {
            id: 'orders',
            title: 'Order Status Report',
            description: 'Comprehensive list of all orders including status, payment, and customer details.',
            icon: ShoppingBag,
            color: 'text-brand',
            bg: 'bg-brand/10',
            type: 'orders'
        },
        {
            id: 'customers',
            title: 'Customer Lifetime Value',
            description: 'Analysis of customer spending habits, order frequency, and loyalty metrics.',
            icon: Users,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            type: 'customers'
        },
        {
            id: 'products',
            title: 'Product Performance',
            description: 'Inventory levels and purchase frequency for all products in your catalog.',
            icon: Package,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            type: 'products'
        },
        {
            id: 'billing',
            title: 'Financial Statements',
            description: 'Detailed billing records, tax calculations, and payment summaries.',
            icon: FileText,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            type: 'billing'
        }
    ];

    return (
        <div className="font-sans pb-12">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-theme">
                <div>
                    <h1 className="text-3xl font-black font-serif text-primary-text tracking-widest uppercase">
                        Report <span className="text-brand italic font-normal">Hub</span>
                    </h1>
                    <p className="text-secondary-text mt-1 text-xs tracking-widest uppercase">Centralized Intelligence & Export</p>
                </div>
                <div className="flex gap-2 bg-secondary border border-theme p-1 rounded-xl">
                    <div className="px-4 py-2 flex items-center gap-2 text-[10px] font-black text-brand uppercase tracking-wider">
                        <ShieldCheck size={14} /> Security Cleared
                    </div>
                </div>
            </header>

            {/* Filter Hub */}
            <div className="bg-secondary border border-theme rounded-2xl p-6 mb-8 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                    <Filter size={16} className="text-brand" />
                    <h3 className="text-sm font-black text-primary-text uppercase tracking-widest">Global Report Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest mb-2 block">Date From</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                            <input 
                                type="date" 
                                value={dateRange.from} 
                                onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))}
                                className="w-full bg-bg-alt border border-theme rounded-xl pl-10 pr-4 py-2.5 text-xs text-primary-text focus:outline-none focus:border-brand/40"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest mb-2 block">Date To</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                            <input 
                                type="date" 
                                value={dateRange.to} 
                                onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))}
                                className="w-full bg-bg-alt border border-theme rounded-xl pl-10 pr-4 py-2.5 text-xs text-primary-text focus:outline-none focus:border-brand/40"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest mb-2 block">Focus Status</label>
                        <select 
                            value={status} 
                            onChange={e => setStatus(e.target.value)}
                            className="w-full bg-bg-alt border border-theme rounded-xl px-4 py-2.5 text-xs text-primary-text focus:outline-none focus:border-brand/40"
                        >
                            <option>All</option>
                            <option>Ordered</option>
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={() => { setDateRange({ from: '', to: '' }); setStatus('All'); }}
                            className="w-full bg-bg-alt border border-theme rounded-xl px-4 py-2.5 text-[10px] font-black text-secondary-text uppercase hover:text-brand transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} /> Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportCards.map((card) => (
                    <div key={card.id} className="bg-secondary border border-theme rounded-2xl p-6 hover:border-brand/30 transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${card.bg}`}>
                                    <card.icon size={20} className={card.color} />
                                </div>
                                <div className="text-[8px] font-black text-brand bg-brand/5 border border-brand/20 px-2 py-1 rounded uppercase tracking-wider">Professional</div>
                            </div>
                            <h3 className="text-xl font-bold font-serif text-primary-text mb-2 tracking-wide group-hover:text-brand transition-colors">{card.title}</h3>
                            <p className="text-xs text-secondary-text leading-relaxed font-medium mb-6">{card.description}</p>
                        </div>
                        
                        <button 
                            onClick={() => handleExport(card.type as any)}
                            disabled={!!loading}
                            className={`
                                w-full flex items-center justify-between px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                                ${loading === card.type 
                                    ? 'bg-bg-alt text-secondary-text cursor-not-allowed' 
                                    : 'bg-bg-alt text-primary-text hover:bg-brand hover:text-black shadow-lg hover:shadow-brand/20'
                                }
                            `}
                        >
                            <span className="flex items-center gap-2">
                                {loading === card.type ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                                {loading === card.type ? 'Generating...' : 'Download CSV Report'}
                            </span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Analysis Section */}
            <div className="mt-12 bg-secondary border border-brand/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="p-5 rounded-full bg-brand/10 border border-brand/30 text-brand">
                        <BarChart2 size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xl font-black text-primary-text uppercase tracking-widest mb-2">Need Custom Analytics?</h4>
                        <p className="text-sm text-secondary-text font-medium">Use the Analytics Intelligence dashboard for visual charts and deep-dive comparisons of your period performance.</p>
                    </div>
                    <Link to="/admin/analytics" className="px-8 py-4 bg-brand text-black font-black uppercase tracking-widest text-xs rounded-xl hover:opacity-90 shadow-xl shadow-brand/20 transition-all whitespace-nowrap">
                        Visit Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ReportHubPage;
