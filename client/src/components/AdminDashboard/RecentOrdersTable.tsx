import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentOrdersTableProps {
    orders: any[];
    handleVerifyPayment: (orderId: string) => void;
}

const RecentOrdersTable = ({ orders, handleVerifyPayment }: RecentOrdersTableProps) => {
    return (
        <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center group">
                <h3 className="text-2xl font-serif font-black text-white tracking-widest uppercase">Live <span className="text-brand italic font-normal">Directives</span></h3>
                <div className="relative w-64">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand opacity-40" />
                    <input
                        type="text"
                        placeholder="Scan Order Registry..."
                        className="w-full pl-12 pr-6 py-3 bg-primary/20 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand/40 transition-all placeholder-white/20"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-sm">
                        {(Array.isArray(orders) ? orders : []).length > 0 ? (
                            (Array.isArray(orders) ? orders : []).map((order: any) => (
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
                                    <td className="px-6 py-4 font-bold text-white">₹{order.totalPrice?.toLocaleString()}</td>
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
                                         <Link to={`/order/${order._id}`} className="px-5 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-brand hover:bg-brand hover:text-black uppercase tracking-widest transition-all">
                                            Intelligence Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">No recent orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-white/10 text-center">
                <Link to="/admin/orders" className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors">
                    View All Orders
                </Link>
            </div>
        </div>
    );
};

export default RecentOrdersTable;
