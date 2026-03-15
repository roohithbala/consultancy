import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { Truck, CheckCircle, Clock, XCircle, Search, Eye } from 'lucide-react';
import { API } from '../../config/api';

interface Order {
    _id: string;
    user: { name: string; email: string };
    totalPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
    createdAt: string;
    status: string;
    paymentMethod: string;
    paymentResult?: { status: string };
}

const OrderListPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth);
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (statusFilter !== 'All') params.append('status', statusFilter);
                if (paymentFilter !== 'All') params.append('paymentMethod', paymentFilter);
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);
                if (searchTerm) params.append('keyword', searchTerm);

                const res = await fetch(`${API}/orders?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${user?.token}` },
                });
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : []);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        if (user && user.role === 'admin') {
            const delayDebounceFn = setTimeout(() => {
                fetchOrders();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [user, statusFilter, paymentFilter, startDate, endDate, searchTerm]);

    const exportToCSV = () => {
        const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Amount', 'Payment', 'Status'];
        const rows = orders.map(o => [
            o._id,
            o.user?.name || 'Guest',
            o.user?.email || 'N/A',
            new Date(o.createdAt).toLocaleDateString(),
            o.totalPrice,
            o.paymentMethod,
            o.status
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };

    const updateStatus = async (id: string, status: string) => {
        if (!window.confirm(`Mark order as ${status}?`)) return;
        try {
            const res = await fetch(`${API}/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setOrders(prev => prev.map(o =>
                    o._id === id ? { ...o, status, isDelivered: status === 'Delivered' } : o
                ));
            }
        } catch (error) { console.error(error); }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Ordered':
            case 'Pending':     return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
            case 'Processing':  return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'Shipped':     return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            case 'Delivered':   return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'Cancelled':   return 'bg-red-500/10 text-red-600 border-red-500/20';
            default:            return 'bg-secondary text-secondary-text border-theme';
        }
    };

    const filteredOrders = orders; // Filtering is now handled by backend query params for better performance

    return (
        <div className="font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-theme">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-primary-text tracking-wide">
                        Order <span className="text-brand">Management</span>
                    </h1>
                    <p className="text-secondary-text mt-2 text-xs tracking-widest uppercase">Fulfillment &amp; Tracking</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex bg-secondary border border-theme rounded-lg overflow-hidden p-1 shadow-sm">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-xs text-primary-text px-2 py-1.5 focus:outline-none focus:border-brand cursor-pointer"
                            title="Start Date"
                        />
                        <span className="text-secondary-text self-center px-1">→</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-xs text-primary-text px-2 py-1.5 focus:outline-none focus:border-brand cursor-pointer"
                            title="End Date"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-secondary border border-theme rounded-lg px-3 py-2 text-xs text-primary-text focus:outline-none focus:border-brand transition-colors shadow-sm cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Ordered">Ordered</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="bg-secondary border border-theme rounded-lg px-3 py-2 text-xs text-primary-text focus:outline-none focus:border-brand transition-colors shadow-sm cursor-pointer"
                    >
                        <option value="All">All Payments</option>
                        <option value="Razorpay">Razorpay</option>
                        <option value="BankTransfer">Bank Transfer</option>
                        <option value="Credit">Credit</option>
                        <option value="COD">COD</option>
                    </select>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                        <input
                            type="text"
                            placeholder="Order ID / Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-secondary border border-theme rounded-lg pl-9 pr-4 py-2 text-xs text-primary-text focus:outline-none focus:border-brand transition-colors w-48 shadow-sm placeholder:text-secondary-text"
                        />
                    </div>
                    <button 
                        onClick={exportToCSV}
                        className="bg-brand text-black px-4 py-2 rounded-lg text-xs font-bold hover:scale-[1.02] transition-all shadow-lg shadow-brand/10 uppercase tracking-wider"
                    >
                        Export CSV
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
                </div>
            ) : (
                <div className="bg-secondary border border-theme rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-bg-alt text-secondary-text text-[10px] uppercase font-bold tracking-widest border-b border-theme">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Update</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-theme text-sm">
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        onClick={() => navigate(`/order/${order._id}`)}
                                        className="hover:bg-bg-alt transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-mono text-secondary-text">
                                            #{order._id.substring(0, 8)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-primary-text font-bold">{order.user?.name || 'Guest'}</div>
                                            <div className="text-xs text-secondary-text">{order.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-secondary-text text-xs">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-primary-text font-mono">
                                            ₹{order.totalPrice.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.paymentResult?.status === 'Pending Verification' ? (
                                                <span className="text-[10px] text-amber-600 border border-amber-500/30 px-2 py-1 rounded bg-amber-500/10 font-bold uppercase tracking-wider">Verify UTR</span>
                                            ) : order.paymentMethod === 'Razorpay' || order.isPaid ? (
                                                <span className="text-[10px] text-green-600 border border-green-500/30 px-2 py-1 rounded bg-green-500/10 font-bold uppercase tracking-wider">Paid</span>
                                            ) : (
                                                <span className="text-[10px] text-secondary-text font-mono">{order.paymentMethod}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/order/${order._id}`} className="text-secondary-text hover:text-primary-text p-1.5 hover:bg-bg-alt rounded transition-colors" title="View">
                                                    <Eye size={15} />
                                                </Link>
                                                {(order.status === 'Ordered' || order.status === 'Pending') && (
                                                    <button onClick={() => updateStatus(order._id, 'Processing')} className="text-amber-600 p-1.5 hover:bg-amber-500/10 rounded transition-colors" title="Mark Processing">
                                                        <Clock size={15} />
                                                    </button>
                                                )}
                                                {order.status === 'Processing' && (
                                                    <button onClick={() => updateStatus(order._id, 'Shipped')} className="text-purple-600 p-1.5 hover:bg-purple-500/10 rounded transition-colors" title="Mark Shipped">
                                                        <Truck size={15} />
                                                    </button>
                                                )}
                                                {order.status === 'Shipped' && (
                                                    <button onClick={() => updateStatus(order._id, 'Delivered')} className="text-green-600 p-1.5 hover:bg-green-500/10 rounded transition-colors" title="Mark Delivered">
                                                        <CheckCircle size={15} />
                                                    </button>
                                                )}
                                                <button onClick={() => updateStatus(order._id, 'Cancelled')} className="text-red-600 p-1.5 hover:bg-red-500/10 rounded transition-colors" title="Cancel">
                                                    <XCircle size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-20 text-secondary-text italic text-sm">No orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderListPage;
