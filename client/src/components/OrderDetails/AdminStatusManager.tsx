import { useState } from 'react';

interface AdminStatusManagerProps {
    order: any;
    token: string;
    onUpdate: (updatedOrder: any) => void;
    getValidNextStatuses: (s: string) => string[];
}

const AdminStatusManager = ({ order, token, onUpdate, getValidNextStatuses }: AdminStatusManagerProps) => {
    const [courier] = useState(order.courierName || 'Blue Dart');
    const [tracking, setTracking] = useState('');

    const updateStatus = async (newStatus: string) => {
        if (!window.confirm(`Update to ${newStatus}?`)) return;
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${order._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) onUpdate(await res.json());
        } catch (e) { console.error(e); }
    };

    const addTracking = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${order._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: order.status, trackingInfo: tracking, courierName: courier })
            });
            if (res.ok) { onUpdate(await res.json()); setTracking(''); }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 p-6 rounded-xl mb-6 no-print shadow-lg">
            <h2 className="text-xl font-serif font-bold mb-4 text-orange-400">📦 Status Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                    <select value={order.status} onChange={(e) => updateStatus(e.target.value)} className="w-full bg-black/50 border border-orange-500/50 text-white p-3 rounded-lg font-bold">
                        {getValidNextStatuses(order.status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                    <input type="text" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Tracking #" className="w-full bg-black/50 border border-orange-500/50 text-white p-3 rounded-lg mb-2" />
                    <button onClick={addTracking} disabled={!tracking} className="w-full bg-orange-500/20 text-orange-400 border border-orange-500/50 p-2 rounded-lg font-bold">Add Tracking</button>
                </div>
            </div>
        </div>
    );
};

export default AdminStatusManager;
