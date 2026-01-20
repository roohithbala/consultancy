import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../store';
import { Truck, CheckCircle, Clock, XCircle, Search, Eye } from 'lucide-react';

interface Order {
    _id: string;
    user: {
        name: string;
        email: string;
    };
    totalPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
    createdAt: string;
    status: string;
    paymentMethod: string;
    paymentResult?: {
        status: string;
    };
}

const OrderListPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/orders', {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });
                const data = await res.json();
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchOrders();
        }
    }, [user]);

    const updateStatus = async (id: string, status: string) => {
        if (!window.confirm(`Mark order as ${status}?`)) return;

        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                setOrders(orders.map(order =>
                    order._id === id ? { ...order, status: status, isDelivered: status === 'Delivered' } : order
                ));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'Processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'Delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const filteredOrders = orders.filter(o =>
        o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-white tracking-wide">
                        Order <span className="text-gold">Management</span>
                    </h1>
                    <p className="text-gray-400 mt-2 text-xs tracking-widest uppercase">Fulfillment & Tracking</p>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-gold transition-colors w-64 md:w-80"
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                </div>
            ) : (
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
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
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-gray-300">
                                            #{order._id.substring(0, 8)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">{order.user?.name || 'Guest'}</div>
                                            <div className="text-xs text-gray-500">{order.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gold font-mono">
                                            ₹{order.totalPrice.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Payment Status Badge */}
                                            {order.paymentResult?.status === 'Pending Verification' ? (
                                                <span className="text-[10px] text-amber-500 border border-amber-500/30 px-2 py-1 rounded bg-amber-500/10 font-bold uppercase tracking-wider">
                                                    Verify UTR
                                                </span>
                                            ) : order.paymentMethod === 'Razorpay' || order.isPaid ? (
                                                <span className="text-[10px] text-green-500 border border-green-500/30 px-2 py-1 rounded bg-green-500/10 font-bold uppercase tracking-wider">
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                    {order.paymentMethod}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/order/${order._id}`} className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded" title="View Details">
                                                    <Eye size={16} />
                                                </Link>
                                                {order.status === 'Pending' && (
                                                    <button onClick={() => updateStatus(order._id, 'Processing')} className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-blue-400/10 rounded" title="Mark Processing">
                                                        <Clock size={16} />
                                                    </button>
                                                )}
                                                {order.status === 'Processing' && (
                                                    <button onClick={() => updateStatus(order._id, 'Shipped')} className="text-purple-400 hover:text-purple-300 p-1.5 hover:bg-purple-400/10 rounded" title="Mark Shipped">
                                                        <Truck size={16} />
                                                    </button>
                                                )}
                                                {order.status === 'Shipped' && (
                                                    <button onClick={() => updateStatus(order._id, 'Delivered')} className="text-green-400 hover:text-green-300 p-1.5 hover:bg-green-400/10 rounded" title="Mark Delivered">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => updateStatus(order._id, 'Cancelled')} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-400/10 rounded" title="Cancel Order">
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-gray-500 italic">No orders found.</td>
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
