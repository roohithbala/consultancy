import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
    DollarSign, AlertTriangle, CheckCircle, Clock, TrendingDown,
    Download, RefreshCw, Plus, Trash2, ChevronDown, ChevronRight,
    FileText, Receipt, CreditCard, BarChart2, Building2
} from 'lucide-react';

import { API as BASE_API } from '../../config/api';
const API = `${BASE_API}/billing`;

const DAY_OPTIONS = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '90 Days', value: '90' },
    { label: '365 Days', value: '365' },
    { label: 'All Time', value: 'all' },
];

const EXPENSE_CATEGORIES = ['Raw Materials', 'Logistics', 'Utilities', 'Salaries', 'Marketing', 'Maintenance', 'Taxes', 'Other'];
const CREDIT_TERMS = [0, 15, 30, 45, 60, 90];

type Tab = 'overview' | 'invoices' | 'aging' | 'gst' | 'expenses' | 'credit';

const BillingPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [tab, setTab] = useState<Tab>('overview');
    const [days, setDays] = useState('30');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [loading, setLoading] = useState(true);
    const [expandedAging, setExpandedAging] = useState<string | null>(null);

    // Customer filter
    const [customers, setCustomers] = useState<any[]>([]);
    const [customerFilter, setCustomerFilter] = useState('all');
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerDropOpen, setCustomerDropOpen] = useState(false);

    // Data
    const [summary, setSummary] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [aging, setAging] = useState<any[]>([]);
    const [gst, setGst] = useState<any>(null);
    const [expenses, setExpenses] = useState<any>(null);
    const [creditCustomers, setCreditCustomers] = useState<any[]>([]);

    // Expense form
    const [expForm, setExpForm] = useState({ description: '', amount: '', category: 'Other', vendor: '', reference: '', date: new Date().toISOString().split('T')[0] });
    const [expLoading, setExpLoading] = useState(false);

    // Credit edit
    const [editCredit, setEditCredit] = useState<any>(null);

    const params = useCallback(() => {
        const p = fromDate && toDate ? `from=${fromDate}&to=${toDate}` : `days=${days}`;
        const c = customerFilter !== 'all' ? `&customerId=${customerFilter}` : '';
        return p + c;
    }, [days, fromDate, toDate, customerFilter]);

    const headers = useCallback(() => ({ headers: { Authorization: `Bearer ${user?.token}` } }), [user?.token]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const p = params();
        try {
            const [summRes, invRes, agingRes, gstRes, expRes, credRes] = await Promise.all([
                fetch(`${API}/summary?${p}`, headers()),
                fetch(`${API}/invoices?status=${invoiceFilter}&${p}`, headers()),
                fetch(`${API}/aging?${p}`, headers()),
                fetch(`${API}/gst?${p}`, headers()),
                fetch(`${API}/expenses?${p}`, headers()),
                fetch(`${API}/credit-customers`, headers()),
            ]);
            setSummary(await summRes.json());
            setInvoices(await invRes.json());
            setAging(await agingRes.json());
            setGst(await gstRes.json());
            setExpenses(await expRes.json());
            setCreditCustomers(await credRes.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [params, invoiceFilter, headers]);

    // Fetch customer list once
    useEffect(() => {
        fetch(`${API}/customers`, headers())
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setCustomers(data); })
            .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.token]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const exportCSV = (data: any[], name: string) => {
        if (!data.length) return;
        const keys = Object.keys(data[0]);
        const csv = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = `${name}.csv`;
        a.click();
    };

    const addExpense = async () => {
        if (!expForm.description || !expForm.amount) return;
        setExpLoading(true);
        await fetch(`${API}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
            body: JSON.stringify({ ...expForm, amount: parseFloat(expForm.amount) })
        });
        setExpForm({ description: '', amount: '', category: 'Other', vendor: '', reference: '', date: new Date().toISOString().split('T')[0] });
        setExpLoading(false);
        fetchAll();
    };

    const deleteExpense = async (id: string) => {
        if (!window.confirm('Delete this expense?')) return;
        await fetch(`${API}/expenses/${id}`, { method: 'DELETE', ...headers() });
        fetchAll();
    };

    const saveCredit = async () => {
        if (!editCredit) return;
        await fetch(`${API}/credit-customers/${editCredit._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
            body: JSON.stringify({
                creditEnabled: editCredit.creditEnabled,
                creditTermsDays: editCredit.creditTermsDays,
                creditLimit: editCredit.creditLimit,
                creditNotes: editCredit.creditNotes,
            })
        });
        setEditCredit(null);
        fetchAll();
    };

    const kpis = summary ? [
        { label: 'Total Billed', value: `₹${summary.totalBilled?.toLocaleString()}`, icon: FileText, color: 'text-brand', bg: 'bg-brand/10' },
        { label: 'Collected', value: `₹${summary.totalCollected?.toLocaleString()}`, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Outstanding', value: `₹${summary.totalOutstanding?.toLocaleString()}`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Overdue', value: `₹${summary.overdueAmount?.toLocaleString()}`, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', alert: summary.overdueCount > 0 },
        { label: 'Total GST', value: `₹${summary.totalTax?.toLocaleString()}`, icon: Receipt, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Expenses', value: `₹${summary.totalExpenses?.toLocaleString()}`, icon: TrendingDown, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Net Profit', value: `₹${summary.netProfit?.toLocaleString()}`, icon: DollarSign, color: summary.netProfit >= 0 ? 'text-brand' : 'text-red-500', bg: summary.netProfit >= 0 ? 'bg-brand/10' : 'bg-red-500/10' },
        { label: 'Total Orders', value: `${summary.totalOrders} / ${summary.paidOrders} Paid`, icon: BarChart2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ] : [];

    const tabs: { key: Tab, label: string, icon: any }[] = [
        { key: 'overview', label: 'Overview', icon: BarChart2 },
        { key: 'invoices', label: 'Invoices', icon: FileText },
        { key: 'aging', label: 'Aging', icon: AlertTriangle },
        { key: 'gst', label: 'GST Report', icon: Receipt },
        { key: 'expenses', label: 'Expenses', icon: TrendingDown },
        { key: 'credit', label: 'Credit', icon: CreditCard },
    ];

    return (
        <div className="font-sans pb-12">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-theme">
                <div>
                    <h1 className="text-3xl font-black font-serif text-primary-text tracking-widest uppercase">
                        Billing <span className="text-brand italic font-normal">Management</span>
                    </h1>
                    <p className="text-secondary-text text-xs mt-1 tracking-widest uppercase">Invoices · Aging · GST · Expenses · Credit</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Customer search combobox */}
                    <div className="relative">
                        <div className={`flex items-center gap-1.5 bg-secondary border rounded-xl px-3 py-2 transition-colors ${customerDropOpen ? 'border-brand/50' : 'border-theme'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-secondary-text flex-shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                            <input
                                type="text"
                                placeholder="Filter by customer…"
                                value={customerFilter !== 'all'
                                    ? (customerSearch !== '' ? customerSearch : (customers.find(c => c._id === customerFilter)?.name || ''))
                                    : customerSearch
                                }
                                onChange={e => {
                                    setCustomerSearch(e.target.value);
                                    if (customerFilter !== 'all') setCustomerFilter('all');
                                    setCustomerDropOpen(true);
                                }}
                                onFocus={() => setCustomerDropOpen(true)}
                                onBlur={() => setTimeout(() => setCustomerDropOpen(false), 150)}
                                className="bg-transparent text-xs text-primary-text placeholder:text-secondary-text focus:outline-none w-40"
                            />
                            {(customerFilter !== 'all' || customerSearch) && (
                                <button
                                    onMouseDown={e => { e.preventDefault(); setCustomerFilter('all'); setCustomerSearch(''); setCustomerDropOpen(false); }}
                                    className="text-secondary-text hover:text-red-500 transition-colors text-[10px] font-black ml-0.5"
                                >✕</button>
                            )}
                        </div>

                        {/* Dropdown list */}
                        {customerDropOpen && (
                            <div className="absolute top-full mt-1 left-0 w-64 bg-secondary border border-theme rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto">
                                <button
                                    onMouseDown={() => { setCustomerFilter('all'); setCustomerSearch(''); setCustomerDropOpen(false); }}
                                    className="w-full text-left px-3 py-2.5 text-xs text-secondary-text hover:bg-bg-alt transition-colors flex items-center gap-2 border-b border-theme"
                                >
                                    <span className="text-base">👥</span> All Customers
                                </button>
                                {customers
                                    .filter(c => !customerSearch ||
                                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                        (c.companyName || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
                                        (c.email || '').toLowerCase().includes(customerSearch.toLowerCase())
                                    )
                                    .map(c => (
                                        <button
                                            key={c._id}
                                            onMouseDown={() => { setCustomerFilter(c._id); setCustomerSearch(''); setCustomerDropOpen(false); }}
                                            className={`w-full text-left px-3 py-2.5 text-xs hover:bg-bg-alt transition-colors flex flex-col gap-0.5 ${
                                                customerFilter === c._id ? 'bg-brand/5 border-l-2 border-brand' : ''
                                            }`}
                                        >
                                            <span className="font-bold text-primary-text">{c.name}</span>
                                            {c.companyName && <span className="text-brand text-[9px]">{c.companyName}</span>}
                                            <span className="text-secondary-text text-[9px]">{c.email}</span>
                                        </button>
                                    ))
                                }
                                {customers.filter(c => !customerSearch ||
                                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                    (c.companyName || '').toLowerCase().includes(customerSearch.toLowerCase())
                                ).length === 0 && (
                                    <p className="text-center py-4 text-xs text-secondary-text italic">No customers match</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Custom date range */}
                    <div className="flex items-center gap-1 bg-secondary border border-theme rounded-xl px-3 py-2">
                        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setDays(''); }}
                            className="bg-transparent text-[10px] text-secondary-text focus:outline-none w-28" />
                        <span className="text-secondary-text text-xs">→</span>
                        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setDays(''); }}
                            className="bg-transparent text-[10px] text-secondary-text focus:outline-none w-28" />
                    </div>

                    {/* Day presets */}
                    <div className="flex gap-1 bg-secondary border border-theme rounded-xl p-1">
                        {DAY_OPTIONS.map(o => (
                            <button key={o.value} onClick={() => { setDays(o.value); setFromDate(''); setToDate(''); }}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${days === o.value && !fromDate ? 'bg-brand text-black' : 'text-secondary-text hover:text-primary-text'}`}>
                                {o.label}
                            </button>
                        ))}
                    </div>

                    <button onClick={fetchAll} className="p-2.5 border border-theme rounded-xl text-secondary-text hover:text-brand transition-all">
                        <RefreshCw size={14} />
                    </button>
                    <button onClick={() => exportCSV(invoices, 'invoices')}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-brand text-black text-[10px] font-black uppercase tracking-wider rounded-xl hover:opacity-90 transition-all">
                        <Download size={13} /> Export
                    </button>
                </div>
            </div>

            {/* Active customer filter badge */}
            {customerFilter !== 'all' && (() => {
                const c = customers.find(x => x._id === customerFilter);
                return c ? (
                    <div className="mb-4 flex items-center gap-2 text-xs">
                        <span className="bg-brand/10 text-brand border border-brand/20 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider">
                            Filtered: {c.name}{c.companyName ? ` · ${c.companyName}` : ''}
                        </span>
                        <button onClick={() => setCustomerFilter('all')} className="text-secondary-text hover:text-red-500 transition-colors text-[10px] font-black uppercase">✕ Clear</button>
                    </div>
                ) : null;
            })()}

            {/* Tab nav */}
            <div className="flex gap-1 flex-wrap bg-secondary border border-theme rounded-2xl p-1 mb-6 w-fit">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${tab === t.key ? 'bg-brand text-black' : 'text-secondary-text hover:text-primary-text'}`}>
                        <t.icon size={12} /> {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand" /></div>
            ) : (
                <>
                    {/* ── OVERVIEW ── */}
                    {tab === 'overview' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {kpis.map((k, i) => (
                                <div key={i} className={`bg-secondary border ${k.alert ? 'border-red-500/40' : 'border-theme'} rounded-2xl p-5 hover:-translate-y-0.5 transition-all group`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`p-2.5 rounded-xl ${k.bg}`}><k.icon size={16} className={k.color} /></div>
                                        {k.alert && <span className="text-[8px] text-red-500 font-black uppercase animate-pulse">⚠ Overdue</span>}
                                    </div>
                                    <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest mb-1">{k.label}</p>
                                    <p className={`text-xl font-black ${k.color} group-hover:opacity-80 transition-opacity`}>{k.value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── INVOICES ── */}
                    {tab === 'invoices' && (
                        <div className="bg-secondary border border-theme rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-5 border-b border-theme flex flex-wrap items-center justify-between gap-3">
                                <div className="flex gap-1">
                                    {(['all', 'paid', 'pending', 'overdue'] as const).map(f => (
                                        <button key={f} onClick={() => setInvoiceFilter(f)}
                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider capitalize transition-all ${invoiceFilter === f ? 'bg-brand text-black' : 'bg-bg-alt text-secondary-text hover:text-primary-text'}`}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => exportCSV(invoices, 'invoices')} className="flex items-center gap-1 text-[10px] text-brand font-black uppercase hover:opacity-70">
                                    <Download size={12} /> Export
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-bg-alt text-secondary-text text-[9px] uppercase font-black tracking-widest border-b border-theme">
                                        <tr>
                                            <th className="px-4 py-3">Invoice #</th>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Due Date</th>
                                            <th className="px-4 py-3">Credit Terms</th>
                                            <th className="px-4 py-3">Amount</th>
                                            <th className="px-4 py-3">Tax</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme text-sm">
                                        {invoices.length === 0 && (
                                            <tr><td colSpan={9} className="text-center py-12 text-secondary-text italic text-xs">No invoices for this period.</td></tr>
                                        )}
                                        {invoices.map((inv: any) => (
                                            <tr key={inv._id} className="hover:bg-bg-alt transition-colors">
                                                <td className="px-4 py-4 font-mono text-secondary-text text-xs">#{inv._id.toString().slice(-8).toUpperCase()}</td>
                                                <td className="px-4 py-4">
                                                    <p className="font-bold text-primary-text text-sm">{inv.customerName}</p>
                                                    {inv.companyName && <p className="text-[9px] text-brand">{inv.companyName}</p>}
                                                </td>
                                                <td className="px-4 py-4 text-xs text-secondary-text">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 text-xs text-secondary-text">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                                <td className="px-4 py-4">
                                                    <span className="text-[9px] font-black uppercase bg-bg-alt text-secondary-text px-2 py-1 rounded-lg">
                                                        {inv.creditTermsDays > 0 ? `Net-${inv.creditTermsDays}` : 'Immediate'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 font-black text-primary-text">₹{inv.totalPrice?.toLocaleString()}</td>
                                                <td className="px-4 py-4 text-xs text-secondary-text">₹{inv.taxPrice?.toLocaleString()}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                                                        inv.payStatus === 'Paid' ? 'bg-green-500/10 text-green-600' :
                                                        inv.payStatus === 'Overdue' ? 'bg-red-500/10 text-red-500' :
                                                        'bg-amber-500/10 text-amber-600'}`}>
                                                        {inv.payStatus}{inv.daysOverdue > 0 ? ` (${inv.daysOverdue}d)` : ''}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {inv.invoiceUrl && (
                                                        <a href={`${API.replace('/api/billing', '')}${inv.invoiceUrl}`} target="_blank" rel="noreferrer"
                                                            className="text-[9px] font-black text-brand hover:underline uppercase">PDF</a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── AGING REPORT ── */}
                    {tab === 'aging' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                                {aging.map((b: any) => (
                                    <div key={b.bucket} className={`bg-secondary border rounded-2xl p-4 text-center ${b.bucket === '90+' ? 'border-red-500/40' : b.bucket === '61-90' ? 'border-orange-500/40' : 'border-theme'}`}>
                                        <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest mb-1">{b.label}</p>
                                        <p className="text-xl font-black text-primary-text">₹{b.total?.toLocaleString()}</p>
                                        <p className="text-[9px] text-secondary-text">{b.count} invoices</p>
                                    </div>
                                ))}
                            </div>

                            {aging.map((b: any) => b.count > 0 && (
                                <div key={b.bucket} className="bg-secondary border border-theme rounded-2xl overflow-hidden">
                                    <button className="w-full p-4 flex items-center justify-between hover:bg-bg-alt transition-all"
                                        onClick={() => setExpandedAging(expandedAging === b.bucket ? null : b.bucket)}>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${b.bucket === '90+' ? 'bg-red-500/10 text-red-500' : b.bucket === '61-90' ? 'bg-orange-500/10 text-orange-500' : b.bucket === '31-60' ? 'bg-amber-500/10 text-amber-600' : 'bg-secondary text-secondary-text'}`}>{b.label}</span>
                                            <span className="font-black text-primary-text">₹{b.total?.toLocaleString()}</span>
                                            <span className="text-xs text-secondary-text">({b.count} invoices)</span>
                                        </div>
                                        {expandedAging === b.bucket ? <ChevronDown size={14} className="text-secondary-text" /> : <ChevronRight size={14} className="text-secondary-text" />}
                                    </button>

                                    {expandedAging === b.bucket && (
                                        <div className="overflow-x-auto border-t border-theme">
                                            <table className="w-full text-left">
                                                <thead className="bg-bg-alt text-[9px] text-secondary-text uppercase font-black tracking-widest">
                                                    <tr>
                                                        <th className="px-4 py-2">Order #</th>
                                                        <th className="px-4 py-2">Customer</th>
                                                        <th className="px-4 py-2">Amount</th>
                                                        <th className="px-4 py-2">Credit Terms</th>
                                                        <th className="px-4 py-2">Due Date</th>
                                                        <th className="px-4 py-2">Days Overdue</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-theme text-xs">
                                                    {b.orders.map((o: any) => (
                                                        <tr key={o.orderId} className="hover:bg-bg-alt">
                                                            <td className="px-4 py-3 font-mono text-secondary-text">#{o.orderId.toString().slice(-8).toUpperCase()}</td>
                                                            <td className="px-4 py-3 font-bold text-primary-text">{o.customer}{o.company ? <span className="ml-1 text-[9px] text-brand font-normal">({o.company})</span> : ''}</td>
                                                            <td className="px-4 py-3 font-black text-primary-text">₹{o.amount?.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-secondary-text">{o.creditTermsDays > 0 ? `Net-${o.creditTermsDays}` : 'Immediate'}</td>
                                                            <td className="px-4 py-3 text-secondary-text">{new Date(o.dueDate).toLocaleDateString()}</td>
                                                            <td className="px-4 py-3">
                                                                {o.daysOverdue > 0 ? (
                                                                    <span className="text-red-500 font-black">{o.daysOverdue} days</span>
                                                                ) : <span className="text-secondary-text">—</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── GST REPORT ── */}
                    {tab === 'gst' && gst && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Taxable Amount', value: `₹${gst.summary?.totalTaxable?.toLocaleString()}` },
                                    { label: 'CGST (9%)', value: `₹${gst.summary?.totalCGST?.toLocaleString()}` },
                                    { label: 'SGST (9%)', value: `₹${gst.summary?.totalSGST?.toLocaleString()}` },
                                    { label: 'Total GST (18%)', value: `₹${gst.summary?.totalGST?.toLocaleString()}` },
                                ].map((s, i) => (
                                    <div key={i} className="bg-secondary border border-theme rounded-2xl p-5">
                                        <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest mb-1">{s.label}</p>
                                        <p className="text-xl font-black text-primary-text">{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Monthly breakdown */}
                            <div className="bg-secondary border border-theme rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-theme flex justify-between items-center">
                                    <h3 className="text-sm font-black text-primary-text uppercase tracking-widest">Monthly GST Breakdown</h3>
                                    <button onClick={() => exportCSV(gst.monthly, 'gst_monthly')} className="flex items-center gap-1 text-[10px] text-brand font-black uppercase hover:opacity-70"><Download size={12} /> Export</button>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-bg-alt text-[9px] text-secondary-text uppercase font-black tracking-widest border-b border-theme">
                                        <tr>
                                            <th className="px-4 py-3">Period</th>
                                            <th className="px-4 py-3">Taxable Amt</th>
                                            <th className="px-4 py-3">CGST</th>
                                            <th className="px-4 py-3">SGST</th>
                                            <th className="px-4 py-3">Total GST</th>
                                            <th className="px-4 py-3">Invoices</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme text-sm">
                                        {gst.monthly?.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-secondary-text italic text-xs">No data for this period.</td></tr>}
                                        {gst.monthly?.map((m: any) => (
                                            <tr key={m.month} className="hover:bg-bg-alt">
                                                <td className="px-4 py-3 font-bold text-primary-text">{m.month}</td>
                                                <td className="px-4 py-3 text-secondary-text">₹{m.taxableAmount?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-purple-500 font-bold">₹{m.cgst?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-purple-500 font-bold">₹{m.sgst?.toLocaleString()}</td>
                                                <td className="px-4 py-3 font-black text-primary-text">₹{m.total?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-secondary-text">{m.invoiceCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Invoice-level GST */}
                            <div className="bg-secondary border border-theme rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-theme flex justify-between items-center">
                                    <h3 className="text-sm font-black text-primary-text uppercase tracking-widest">Invoice GST Detail</h3>
                                    <button onClick={() => exportCSV(gst.orders, 'gst_invoices')} className="flex items-center gap-1 text-[10px] text-brand font-black uppercase hover:opacity-70"><Download size={12} /> Export</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-bg-alt text-[9px] text-secondary-text uppercase font-black tracking-widest border-b border-theme">
                                            <tr>
                                                <th className="px-4 py-3">Invoice #</th>
                                                <th className="px-4 py-3">Customer</th>
                                                <th className="px-4 py-3">GST No</th>
                                                <th className="px-4 py-3">Taxable</th>
                                                <th className="px-4 py-3">CGST</th>
                                                <th className="px-4 py-3">SGST</th>
                                                <th className="px-4 py-3">Total GST</th>
                                                <th className="px-4 py-3">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-theme text-sm">
                                            {gst.orders?.map((o: any) => (
                                                <tr key={o.orderId} className="hover:bg-bg-alt">
                                                    <td className="px-4 py-3 font-mono text-secondary-text text-xs">#{o.orderId.toString().slice(-8).toUpperCase()}</td>
                                                    <td className="px-4 py-3 font-bold text-primary-text">{o.customer}{o.company ? <span className="ml-1 text-[9px] text-brand">({o.company})</span> : ''}</td>
                                                    <td className="px-4 py-3 text-xs text-secondary-text font-mono">{o.gstNo}</td>
                                                    <td className="px-4 py-3 text-secondary-text">₹{o.taxable?.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-purple-500">₹{o.cgst?.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-purple-500">₹{o.sgst?.toLocaleString()}</td>
                                                    <td className="px-4 py-3 font-bold text-primary-text">₹{o.total?.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-xs text-secondary-text">{new Date(o.date).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── EXPENSES ── */}
                    {tab === 'expenses' && (
                        <div className="space-y-6">
                            {/* Add expense */}
                            <div className="bg-secondary border border-theme rounded-2xl p-6">
                                <h3 className="text-sm font-black text-primary-text uppercase tracking-widest mb-4 flex items-center gap-2"><Plus size={14} />Add Expense</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <input placeholder="Description *" value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))}
                                        className="col-span-2 md:col-span-2 px-3 py-2.5 bg-bg-alt border border-theme rounded-xl text-xs text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-brand/40" />
                                    <input type="number" placeholder="Amount (₹) *" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))}
                                        className="px-3 py-2.5 bg-bg-alt border border-theme rounded-xl text-xs text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-brand/40" />
                                    <select value={expForm.category} onChange={e => setExpForm(p => ({ ...p, category: e.target.value }))}
                                        className="px-3 py-2.5 bg-bg-alt border border-theme rounded-xl text-xs text-primary-text focus:outline-none focus:border-brand/40">
                                        {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                    <input placeholder="Vendor" value={expForm.vendor} onChange={e => setExpForm(p => ({ ...p, vendor: e.target.value }))}
                                        className="px-3 py-2.5 bg-bg-alt border border-theme rounded-xl text-xs text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-brand/40" />
                                    <input type="date" value={expForm.date} onChange={e => setExpForm(p => ({ ...p, date: e.target.value }))}
                                        className="px-3 py-2.5 bg-bg-alt border border-theme rounded-xl text-xs text-primary-text focus:outline-none focus:border-brand/40" />
                                </div>
                                <button onClick={addExpense} disabled={expLoading}
                                    className="mt-3 px-6 py-2.5 bg-brand text-black text-[10px] font-black uppercase tracking-wider rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
                                    {expLoading ? 'Saving…' : '+ Add Expense'}
                                </button>
                            </div>

                            {/* Category breakdown */}
                            {expenses?.byCategory && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {Object.entries(expenses.byCategory).map(([cat, amt]: any) => (
                                        <div key={cat} className="bg-secondary border border-theme rounded-2xl p-4">
                                            <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest mb-1">{cat}</p>
                                            <p className="text-lg font-black text-primary-text">₹{amt?.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Expense list */}
                            <div className="bg-secondary border border-theme rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-theme flex justify-between items-center">
                                    <h3 className="text-sm font-black text-primary-text uppercase tracking-widest">Expense Ledger — Total: ₹{expenses?.total?.toLocaleString()}</h3>
                                    <button onClick={() => exportCSV(expenses?.expenses || [], 'expenses')} className="flex items-center gap-1 text-[10px] text-brand font-black uppercase hover:opacity-70"><Download size={12} /> Export</button>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-bg-alt text-[9px] text-secondary-text uppercase font-black tracking-widest border-b border-theme">
                                        <tr>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Description</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3">Vendor</th>
                                            <th className="px-4 py-3">Amount</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme text-sm">
                                        {(!expenses?.expenses || expenses.expenses.length === 0) && (
                                            <tr><td colSpan={6} className="text-center py-10 text-secondary-text italic text-xs">No expenses recorded.</td></tr>
                                        )}
                                        {expenses?.expenses?.map((e: any) => (
                                            <tr key={e._id} className="hover:bg-bg-alt">
                                                <td className="px-4 py-3 text-xs text-secondary-text">{new Date(e.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-bold text-primary-text">{e.description}</td>
                                                <td className="px-4 py-3"><span className="text-[9px] bg-bg-alt text-secondary-text px-2 py-1 rounded-lg font-black uppercase">{e.category}</span></td>
                                                <td className="px-4 py-3 text-secondary-text text-xs">{e.vendor || '—'}</td>
                                                <td className="px-4 py-3 font-black text-orange-500">₹{e.amount?.toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => deleteExpense(e._id)} className="text-red-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── CREDIT MANAGEMENT ── */}
                    {tab === 'credit' && (
                        <div className="space-y-4">
                            <div className="bg-secondary border border-brand/20 rounded-2xl p-4 text-xs text-secondary-text">
                                <strong className="text-primary-text">Credit Terms</strong> — Enable credit for trusted customers and set their payment window (Net-15, Net-30, etc.) and maximum credit limit. The Aging Report automatically accounts for their payment terms.
                            </div>

                            {editCredit && (
                                <div className="bg-secondary border border-brand rounded-2xl p-6">
                                    <h3 className="font-black text-primary-text uppercase tracking-widest text-sm mb-4">Edit Credit: {editCredit.name}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setEditCredit((p: any) => ({ ...p, creditEnabled: !p.creditEnabled }))}
                                                className={`w-10 h-5 rounded-full relative transition-all ${editCredit.creditEnabled ? 'bg-brand' : 'bg-bg-alt border border-theme'}`}>
                                                <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-all shadow ${editCredit.creditEnabled ? 'translate-x-5' : ''}`} />
                                            </button>
                                            <span className="text-xs font-bold text-primary-text">{editCredit.creditEnabled ? 'Credit Enabled' : 'No Credit'}</span>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-secondary-text uppercase tracking-wider mb-1 block">Payment Terms</label>
                                            <select value={editCredit.creditTermsDays} onChange={e => setEditCredit((p: any) => ({ ...p, creditTermsDays: parseInt(e.target.value) }))}
                                                className="w-full px-3 py-2 bg-bg-alt border border-theme rounded-xl text-xs text-primary-text focus:outline-none focus:border-brand/40">
                                                {CREDIT_TERMS.map(t => <option key={t} value={t}>{t === 0 ? 'Immediate (Net-0)' : `Net-${t}`}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-secondary-text uppercase tracking-wider mb-1 block">Credit Limit (₹)</label>
                                            <input type="number" value={editCredit.creditLimit} onChange={e => setEditCredit((p: any) => ({ ...p, creditLimit: parseFloat(e.target.value) }))}
                                                className="w-full px-3 py-2 bg-bg-alt border border-theme rounded-xl text-xs text-primary-text focus:outline-none focus:border-brand/40" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-secondary-text uppercase tracking-wider mb-1 block">Notes</label>
                                            <input value={editCredit.creditNotes || ''} onChange={e => setEditCredit((p: any) => ({ ...p, creditNotes: e.target.value }))}
                                                placeholder="Internal notes..."
                                                className="w-full px-3 py-2 bg-bg-alt border border-theme rounded-xl text-xs text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-brand/40" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={saveCredit} className="px-5 py-2 bg-brand text-black text-[10px] font-black uppercase tracking-wider rounded-xl">Save</button>
                                        <button onClick={() => setEditCredit(null)} className="px-5 py-2 bg-bg-alt text-secondary-text text-[10px] font-black uppercase tracking-wider rounded-xl hover:text-primary-text">Cancel</button>
                                    </div>
                                </div>
                            )}

                            <div className="bg-secondary border border-theme rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-theme"><h3 className="text-sm font-black text-primary-text uppercase tracking-widest flex items-center gap-2"><Building2 size={14} />Customer Credit Schedule</h3></div>
                                <table className="w-full text-left">
                                    <thead className="bg-bg-alt text-[9px] text-secondary-text uppercase font-black tracking-widest border-b border-theme">
                                        <tr>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Credit</th>
                                            <th className="px-4 py-3">Terms</th>
                                            <th className="px-4 py-3">Limit</th>
                                            <th className="px-4 py-3">Outstanding</th>
                                            <th className="px-4 py-3">Overdue</th>
                                            <th className="px-4 py-3">Utilization</th>
                                            <th className="px-4 py-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme text-sm">
                                        {creditCustomers.length === 0 && (
                                            <tr><td colSpan={8} className="text-center py-10 text-secondary-text italic text-xs">No customers found.</td></tr>
                                        )}
                                        {creditCustomers.map((c: any) => (
                                            <tr key={c._id} className="hover:bg-bg-alt">
                                                <td className="px-4 py-4">
                                                    <p className="font-bold text-primary-text">{c.name}</p>
                                                    {c.companyName && <p className="text-[9px] text-brand">{c.companyName}</p>}
                                                    <p className="text-[9px] text-secondary-text">{c.email}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${c.creditEnabled ? 'bg-brand/10 text-brand' : 'bg-bg-alt text-secondary-text'}`}>
                                                        {c.creditEnabled ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-xs text-secondary-text font-black">{c.creditTermsDays > 0 ? `Net-${c.creditTermsDays}` : 'Immediate'}</td>
                                                <td className="px-4 py-4 text-xs text-primary-text">₹{c.creditLimit?.toLocaleString() || '—'}</td>
                                                <td className="px-4 py-4 text-xs font-bold text-amber-500">₹{c.outstanding?.toLocaleString()}</td>
                                                <td className="px-4 py-4">
                                                    {c.overdueAmount > 0
                                                        ? <span className="text-red-500 font-black text-xs">₹{c.overdueAmount?.toLocaleString()}</span>
                                                        : <span className="text-secondary-text text-xs">—</span>}
                                                </td>
                                                <td className="px-4 py-4 w-28">
                                                    {c.creditLimit > 0 ? (
                                                        <div>
                                                            <div className="h-1.5 bg-bg-alt rounded-full overflow-hidden mb-1">
                                                                <div className={`h-full rounded-full ${c.utilizationPct > 80 ? 'bg-red-500' : c.utilizationPct > 50 ? 'bg-amber-500' : 'bg-brand'}`} style={{ width: `${Math.min(c.utilizationPct, 100)}%` }} />
                                                            </div>
                                                            <p className="text-[8px] text-secondary-text">{c.utilizationPct}% used</p>
                                                        </div>
                                                    ) : <span className="text-secondary-text text-xs">No limit set</span>}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button onClick={() => setEditCredit({ ...c })}
                                                        className="text-[9px] font-black text-brand hover:underline uppercase tracking-wider">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BillingPage;
