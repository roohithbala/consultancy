interface AdminDeliveryCardProps {
    order: any;
    getTrackingUrl: (c: string, t: string) => string;
}

const AdminDeliveryCard = ({ order, getTrackingUrl }: AdminDeliveryCardProps) => {
    return (
        <div className="bg-secondary border border-theme p-6 rounded-xl mb-6 no-print shadow-xl">
            <h2 className="text-xl font-serif font-bold mb-4 text-primary-text">🚚 Delivery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Box label="Method" value={order.deliveryMethod || 'Courier'} />
                <Box label="Status" value={order.isDelivered ? '✓ DELIVERED' : '⏳ IN TRANSIT'} color={order.isDelivered ? 'text-brand' : 'text-amber-500'} sub={order.deliveredAt && new Date(order.deliveredAt).toLocaleString()} />
                <div className="bg-bg-alt p-4 rounded-lg border border-theme col-span-1 md:col-span-2">
                    <p className="text-xs text-secondary-text uppercase tracking-wider mb-2 font-bold">Shipping Address</p>
                    <p className="text-primary-text text-sm leading-relaxed">
                        {order.shippingAddress?.address}<br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                    </p>
                </div>
                {(order.trackingNumber || order.courierName) && (
                    <div className="bg-bg-alt p-4 rounded-lg border border-theme col-span-1 md:col-span-2">
                        <p className="text-xs text-secondary-text uppercase tracking-wider mb-2 font-bold">Tracking</p>
                        <p className="text-primary-text font-bold">{order.courierName} -
                            <a href={getTrackingUrl(order.courierName || '', order.trackingNumber)} target="_blank" rel="noreferrer" className="text-brand underline ml-2">{order.trackingNumber}</a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Box = ({ label, value, color = 'text-primary-text', sub }: any) => (
    <div className="bg-bg-alt p-4 rounded-lg border border-theme">
        <p className="text-xs text-secondary-text uppercase tracking-wider mb-2 font-bold">{label}</p>
        <p className={`${color} font-bold text-lg`}>{value}</p>
        {sub && <p className="text-xs text-secondary-text mt-1">{sub}</p>}
    </div>
);

export default AdminDeliveryCard;
