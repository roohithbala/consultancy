interface OrderActionButtonsProps {
    status: string;
    orderId: string;
    token: string;
    onStatusUpdate: (updatedOrder: any) => void;
    refundStatus?: string;
    refundAmount?: number;
}

const OrderActionButtons = ({ status, orderId, token, onStatusUpdate, refundStatus, refundAmount }: OrderActionButtonsProps) => {
    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ reason: 'User requested cancellation' })
            });
            if (res.ok) onStatusUpdate(await res.json());
            else alert('Failed to cancel order');
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 no-print">
            <div className="flex-1">
                {refundStatus && refundStatus !== 'None' && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r shadow-sm">
                        <p className="text-sm text-blue-700">
                            <span className="font-bold">Refund:</span> {refundStatus} 
                            {refundAmount && ` (₹${refundAmount})`}
                        </p>
                    </div>
                )}
            </div>
            <div className="flex gap-4">
                {!['Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'].includes(status) && (
                    <button onClick={handleCancel} className="bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-lg font-bold hover:bg-red-100 transition-colors uppercase tracking-widest text-xs">
                        Cancel Order
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderActionButtons;
