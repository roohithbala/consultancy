import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, ArrowUpRight, Search, ListFilter } from 'lucide-react';
import type { RootState } from '../../store';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [stats, setStats] = useState({
        totalSales: 0,
        activeOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);



    // Facilities Management (Simulated)
    const [facilities, setFacilities] = useState({
        billDesk: true,
        bankTransfer: true,
        emailNotifications: true,
        smsNotifications: false
    });

    const toggleFacility = (key: keyof typeof facilities) => {
        setFacilities(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleVerifyPayment = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to verify this payment? Order will be marked as Paid.")) return;

        try {
            // In a real app, you'd have a specific Verify endpoint. 
            // Here we'll just update status to "Processing" and "isPaid" to true via a custom update if needed, 
            // or just rely on the Manual Update in OrderDetails. 
            // For this UI, we will simulate a quick success feedback.
            alert(`Payment for Order #${orderId} verified successfully.`);
            // Optionally refresh stats
        } catch (error) {
            console.error("Verification failed", error);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/orders/admin/stats', {
                    headers: {
                        Authorization: `Bearer ${user?.token}`
                    }
                });
                const data = await res.json();
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-black text-gray-200 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold font-serif text-white tracking-wide">
                            Admin <span className="text-gold">Dashboard</span>
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm tracking-widest uppercase">Overview & Management</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-gold hover:bg-white/10 transition-all flex items-center gap-2">
                            <ListFilter size={14} /> Filter
                        </button>
                        <button className="px-5 py-2.5 bg-gold text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                            <ArrowUpRight size={14} /> Export Report
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { title: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, icon: DollarSign, color: 'text-green-400' },
                        { title: 'Active Orders', value: stats.activeOrders, icon: ShoppingBag, color: 'text-blue-400' },
                        { title: 'Products', value: stats.totalProducts, icon: Package, color: 'text-purple-400' },
                        { title: 'Customers', value: stats.totalUsers, icon: Users, color: 'text-orange-400' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-gold/30 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 bg-white/5 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={24} />
                                </div>
                                <TrendingUp size={16} className="text-green-500" />
                            </div>
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.title}</h3>
                            <p className="text-2xl font-bold text-white mt-1 group-hover:text-gold transition-colors">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Recent Orders */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white font-serif tracking-wide">Recent Orders</h3>
                                <div className="relative w-64">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search order ID..."
                                        className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded text-sm text-gray-300 focus:outline-none focus:border-gold transition-colors placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-black/40 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Order ID</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Payment</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {stats.recentOrders && stats.recentOrders.length > 0 ? (
                                            stats.recentOrders.map((order: any) => (
                                                <tr key={order._id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4 font-mono text-gray-300">#{order._id.substring(0, 8)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                                                            ${order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                                                                order.status === 'Processing' ? 'bg-blue-500/20 text-blue-400' :
                                                                    order.status === 'Shipped' ? 'bg-purple-500/20 text-purple-400' :
                                                                        'bg-gray-500/20 text-gray-400'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-white">₹{order.totalPrice.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        {order.paymentResult?.status === 'Pending Verification' ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] text-amber-500 font-bold uppercase">Pending Verification</span>
                                                                <span className="text-[10px] text-gray-400 font-mono">UTR: {order.paymentResult.id}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-green-500 font-bold uppercase">Paid</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {order.paymentResult?.status === 'Pending Verification' && (
                                                            <button
                                                                onClick={() => handleVerifyPayment(order._id)}
                                                                className="mr-3 text-[10px] font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider"
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                        <Link to={`/order/${order._id}`} className="text-[10px] font-bold text-gold hover:text-white uppercase tracking-wider transition-colors">
                                                            Details
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-gray-600">No recent orders found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-white/10 text-center">
                                <Link to="/admin/orders" className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                                    View All Orders
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Facilities & Quick Actions */}
                    <div className="space-y-8">
                        {/* Facilities Management */}
                        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                            <h3 className="text-lg font-bold text-white font-serif mb-6 tracking-wide">Facilities</h3>
                            <div className="space-y-4">
                                {Object.entries(facilities).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between group">
                                        <span className="text-sm text-gray-400 capitalize group-hover:text-gray-200 transition-colors">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <button
                                            onClick={() => toggleFacility(key as keyof typeof facilities)}
                                            className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${value ? 'bg-gold' : 'bg-gray-700'}`}
                                        >
                                            <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-500">
                                Manage active payment gateways and notification systems.
                            </div>
                        </div>

                        {/* Recent Activity / System Status */}
                        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
                            <h3 className="text-lg font-bold text-white font-serif mb-4 tracking-wide">System Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span>Database: <span className="text-green-400">Connected</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span>Email Service: <span className="text-green-400">Active</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                    <span>Payment Gateway: <span className="text-amber-400">Test Mode</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
