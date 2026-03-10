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
        <div className="bg-secondary border border-theme p-6 rounded-xl mb-6 no-print shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-serif font-bold text-primary-text flex items-center gap-2">💳 Payment Details</h2>
                {order.paymentMethod === 'BankTransfer' && (
                    <button onClick={togglePaid} className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${order.isPaid ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-green-500/10 text-brand border border-brand/30'}`}>
                        {order.isPaid ? '✗ Mark Unpaid' : '✓ Verify Paid'}
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox label="Method" value={order.paymentMethod || 'N/A'} />
                <StatBox label="Status" value={order.isPaid ? '✓ PAID' : '✗ UNPAID'} color={order.isPaid ? 'text-brand' : 'text-red-500'} sub={order.paidAt && new Date(order.paidAt).toLocaleString()} />
                <StatBox label="UTR / ID" value={order.paymentResult?.id || 'Online Payment'} />
                {order.isCredit && (
                    <StatBox label="Credit Order" value={`Net-${order.creditTermsDays || 0} · Due ${new Date(order.creditDueDate).toLocaleDateString()}`} color="text-amber-500" />
                )}
            </div>
        </div>
    );
};

const StatBox = ({ label, value, color = 'text-primary-text', sub }: any) => (
    <div className="bg-bg-alt p-4 rounded-lg border border-theme">
        <p className="text-xs text-secondary-text uppercase tracking-wider mb-1 font-bold">{label}</p>
        <p className={`${color} font-bold text-lg`}>{value}</p>
        {sub && <p className="text-xs text-secondary-text mt-1">{sub}</p>}
    </div>
);

export default AdminPaymentCard;
