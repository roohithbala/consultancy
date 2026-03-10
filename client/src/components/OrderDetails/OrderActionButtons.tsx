interface OrderActionButtonsProps {
    status: string;
    orderId: string;
    token: string;
    onStatusUpdate: (updatedOrder: any) => void;
    refundStatus?: string;
    refundAmount?: number;
    isAdmin?: boolean;
}

const OrderActionButtons = ({ status, orderId, token, onStatusUpdate, refundStatus, refundAmount, isAdmin }: OrderActionButtonsProps) => {
    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ reason: 'User requested cancellation' })
            });
            if (res.ok) onStatusUpdate(await res.json());
            else {
                const err = await res.json();
                alert(err.message || 'Failed to cancel order');
            }
        } catch (e) { console.error(e); }
    };

    // Customers can only cancel in 'Ordered' status.
    // Admins can cancel in 'Ordered' or 'Processing'.
    const canCancel = isAdmin
        ? ['Ordered', 'Processing'].includes(status)
        : status === 'Ordered';

    return (
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 no-print">
            <div className="flex-1">
                {refundStatus && refundStatus !== 'None' && (
                    <div className="bg-brand/5 border-l-4 border-brand p-4 mb-4 rounded-r shadow-sm">
                        <p className="text-primary-text text-sm font-medium">
                            <span className="font-bold">Refund:</span> {refundStatus}
                            {refundAmount && ` (₹${refundAmount})`}
                        </p>
                    </div>
                )}
                {status === 'Processing' && !isAdmin && (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg text-xs text-amber-600 font-medium">
                        ⚠ Order is being processed — cancellation is no longer available. Contact support if needed.
                    </div>
                )}
            </div>
            <div className="flex gap-4">
                {canCancel && (
                    <button onClick={handleCancel} className="bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-lg font-bold hover:bg-red-100 transition-colors uppercase tracking-widest text-xs">
                        Cancel Order
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderActionButtons;
