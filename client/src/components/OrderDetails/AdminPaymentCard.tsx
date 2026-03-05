interface AdminPaymentCardProps {
    order: any;
    token: string;
    onUpdate: (updatedOrder: any) => void;
}

const AdminPaymentCard = ({ order, token, onUpdate }: AdminPaymentCardProps) => {
    const togglePaid = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${order._id}/payment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isPaid: !order.isPaid })
            });
            if (res.ok) onUpdate(await res.json());
        } catch (error) { console.error(error); }
    };

    return (
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 p-6 rounded-xl mb-6 no-print shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-serif font-bold text-green-400">💳 Payment Details</h2>
                {order.paymentMethod === 'BankTransfer' && (
                    <button onClick={togglePaid} className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${order.isPaid ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
                        {order.isPaid ? '✗ Mark Unpaid' : '✓ Verify Paid'}
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox label="Method" value={order.paymentMethod || 'N/A'} />
                <StatBox label="Status" value={order.isPaid ? '✓ PAID' : '✗ UNPAID'} color={order.isPaid ? 'text-green-400' : 'text-red-400'} sub={order.paidAt && new Date(order.paidAt).toLocaleString()} />
                <StatBox label="UTR / ID" value={order.paymentResult?.id || 'Online Payment'} />
            </div>
        </div>
    );
};

const StatBox = ({ label, value, color = 'text-white', sub }: any) => (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`${color} font-bold text-lg`}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
);

export default AdminPaymentCard;
