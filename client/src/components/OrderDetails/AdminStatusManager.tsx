import { useState } from 'react';
import { CheckCircle, ChevronRight, Truck } from 'lucide-react';

interface AdminStatusManagerProps {
    order: any;
    token: string;
    onUpdate: (updatedOrder: any) => void;
    getValidNextStatuses: (s: string) => string[];
}

const STATUS_COLORS: Record<string, string> = {
    Ordered: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    Processing: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    Shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    Out: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    Delivered: 'bg-brand/10 text-brand border-brand/30',
    Cancelled: 'bg-red-500/10 text-red-500 border-red-500/30',
    Pending: 'bg-bg-alt text-secondary-text border-theme',
};

const AdminStatusManager = ({ order, token, onUpdate, getValidNextStatuses }: AdminStatusManagerProps) => {
    const [courier, setCourier] = useState(order.courierName || 'Blue Dart');
    const [tracking, setTracking] = useState('');
    const [loading, setLoading] = useState(false);

    const validStatuses = getValidNextStatuses(order.status);
    const nextStatuses = validStatuses.filter(s => s !== order.status);

    const updateStatus = async (newStatus: string) => {
        if (!window.confirm(`Move order to "${newStatus}"?`)) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${order._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                onUpdate(await res.json());
            } else {
                const err = await res.json();
                alert(`Failed: ${err.message || res.statusText}`);
            }
        } catch (e) { console.error(e); alert('Network error occurred.'); }
        setLoading(false);
    };

    const addTracking = async () => {
        if (!tracking.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${order._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: order.status, trackingInfo: tracking.trim(), courierName: courier })
            });
            if (res.ok) {
                onUpdate(await res.json());
                setTracking('');
                alert('Tracking details saved!');
            } else {
                const err = await res.json();
                alert(`Failed: ${err.message || res.statusText}`);
            }
        } catch (e) { console.error(e); alert('Network error occurred.'); }
        setLoading(false);
    };

    return (
        <div className="bg-secondary border border-theme p-6 rounded-xl mb-6 no-print shadow-xl">
            <h2 className="text-xl font-serif font-bold mb-5 text-primary-text flex items-center gap-2">
                📦 Status Management
            </h2>

            <div className="mb-5">
                <p className="text-xs text-secondary-text uppercase tracking-wider mb-2 font-bold">Current Status</p>
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-bold ${STATUS_COLORS[order.status] || STATUS_COLORS['Pending']}`}>
                    <CheckCircle size={14} />
                    {order.status}
                </span>
            </div>

            {nextStatuses.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs text-secondary-text uppercase tracking-wider mb-3 font-bold">Advance Order To</p>
                    <div className="flex flex-wrap gap-3">
                        {nextStatuses.map(s => (
                            <button
                                key={s}
                                onClick={() => updateStatus(s)}
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 text-sm"
                            >
                                <ChevronRight size={16} />
                                Move to {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {order.status === 'Delivered' && (
                <p className="text-sm text-brand font-bold">✅ Order has been delivered.</p>
            )}
            {order.status === 'Cancelled' && (
                <p className="text-sm text-red-500 font-bold">❌ Order is cancelled.</p>
            )}

            <div className="mt-6 pt-6 border-t border-theme">
                <p className="text-xs text-secondary-text uppercase tracking-wider mb-3 font-bold flex items-center gap-1.5">
                    <Truck size={12} /> Delivery Tracking
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                        value={courier}
                        onChange={e => setCourier(e.target.value)}
                        className="bg-bg-alt border border-theme text-primary-text p-3 rounded-lg font-medium outline-none focus:ring-2 focus:ring-brand text-sm"
                    >
                        {['Blue Dart', 'DTDC', 'Delhivery', 'FedEx', 'Ekart', 'Amazon Shipping', 'India Post'].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={tracking}
                        onChange={e => setTracking(e.target.value)}
                        placeholder="Tracking Number"
                        className="md:col-span-1 bg-bg-alt border border-theme text-primary-text p-3 rounded-lg outline-none focus:ring-2 focus:ring-brand transition-all text-sm placeholder:text-secondary-text"
                    />
                    <button
                        onClick={addTracking}
                        disabled={!tracking.trim() || loading}
                        className="bg-brand/10 border border-brand text-brand p-3 rounded-lg font-bold hover:bg-brand hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                    >
                        Save Tracking
                    </button>
                </div>
                {order.trackingNumber && (
                    <p className="mt-2 text-xs text-secondary-text">
                        Current: <span className="font-bold text-primary-text">{order.courierName} — {order.trackingNumber}</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminStatusManager;
