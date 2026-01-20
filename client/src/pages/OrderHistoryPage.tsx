import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingBag, Eye, Clock, CheckCircle, Package, XCircle, ArrowRight } from 'lucide-react';
import type { RootState } from '../store';

const OrderHistoryPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const res = await fetch('http://localhost:5000/api/orders/myorders', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const data = await res.json();
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders", error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (!user) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Please login to view your orders.</div>;
    }

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading your orders...</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'text-green-400 bg-green-900/20 border-green-900/50';
            case 'Processing': return 'text-blue-400 bg-blue-900/20 border-blue-900/50';
            case 'Shipped': return 'text-purple-400 bg-purple-900/20 border-purple-900/50';
            case 'Cancelled': return 'text-red-400 bg-red-900/20 border-red-900/50';
            default: return 'text-gold bg-gold/10 border-gold/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Delivered': return <CheckCircle size={14} />;
            case 'Processing': return <Clock size={14} />;
            case 'Shipped': return <Package size={14} />;
            case 'Cancelled': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-gray-200 font-sans pt-24 pb-12 selection:bg-gold selection:text-black">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                    <div>
                        <span className="text-gold uppercase tracking-[0.2em] text-xs font-bold">Traceability</span>
                        <h1 className="text-4xl font-serif font-bold text-white mt-2">
                            Order <span className="text-gray-500">History</span>
                        </h1>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-20 text-center backdrop-blur-sm">
                        <ShoppingBag size={64} className="mx-auto text-gray-600 mb-6" strokeWidth={1} />
                        <h2 className="text-2xl font-serif font-bold text-white mb-4">No Digital Records Found</h2>
                        <p className="text-gray-400 mb-10 font-light text-lg">Your portfolio of orders will appear here once you start exploring our collection.</p>
                        <Link to="/products" className="inline-flex items-center gap-2 bg-gold text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-white transition-all">
                            Browse Collection <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order: any) => (
                            <div key={order._id} className="group bg-white/5 border border-white/10 p-8 hover:border-gold/30 transition-all duration-300 relative overflow-hidden">
                                {/* Hover Effect Line */}
                                <div className="absolute left-0 top-0 h-full w-1 bg-gold transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>

                                <div className="flex flex-col md:flex-row justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="font-mono text-sm text-gray-500 border border-white/10 px-2 py-1 rounded">#{order._id.substring(0, 10)}...</span>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-2 uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)} {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-400 mb-6 flex items-center gap-2">
                                            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                            Ordered on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {order.orderItems.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-4 bg-black/20 p-3 rounded border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="w-12 h-12 bg-gray-800 overflow-hidden flex-shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{item.name}</p>
                                                        <p className="text-xs text-gold uppercase tracking-wider">{item.quantity} m {item.type === 'sample' && '(Sample)'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-between min-w-[200px] border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Value</p>
                                            <p className="text-2xl font-serif font-bold text-white">₹{order.totalPrice}</p>
                                        </div>

                                        <Link
                                            to={`/order/${order._id}`}
                                            className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-white/20 px-6 py-3 text-white hover:bg-white hover:text-black transition-all"
                                        >
                                            <Eye size={16} /> View Invoice
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;
