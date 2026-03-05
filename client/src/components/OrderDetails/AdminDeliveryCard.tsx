interface AdminDeliveryCardProps {
    order: any;
    getTrackingUrl: (c: string, t: string) => string;
}

const AdminDeliveryCard = ({ order, getTrackingUrl }: AdminDeliveryCardProps) => {
    return (
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-6 rounded-xl mb-6 no-print shadow-lg">
            <h2 className="text-xl font-serif font-bold mb-4 text-purple-400">🚚 Delivery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Box label="Method" value={order.deliveryMethod || 'Courier'} />
                <Box label="Status" value={order.isDelivered ? '✓ DELIVERED' : '⏳ IN TRANSIT'} color={order.isDelivered ? 'text-green-400' : 'text-yellow-400'} sub={order.deliveredAt && new Date(order.deliveredAt).toLocaleString()} />
                <div className="bg-black/30 p-4 rounded-lg border border-white/10 col-span-1 md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Shipping Address</p>
                    <p className="text-white text-sm leading-relaxed">
                        {order.shippingAddress?.address}<br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                    </p>
                </div>
                {(order.trackingNumber || order.courierName) && (
                    <div className="bg-black/30 p-4 rounded-lg border border-white/10 col-span-1 md:col-span-2">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Tracking</p>
                        <p className="text-white font-bold">{order.courierName} - 
                            <a href={getTrackingUrl(order.courierName || '', order.trackingNumber)} target="_blank" rel="noreferrer" className="text-gold underline ml-2">{order.trackingNumber}</a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Box = ({ label, value, color = 'text-white', sub }: any) => (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{label}</p>
        <p className={`${color} font-bold text-lg`}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
);

export default AdminDeliveryCard;
