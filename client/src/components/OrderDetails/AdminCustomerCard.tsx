interface AdminCustomerCardProps {
    order: any;
}

const AdminCustomerCard = ({ order }: AdminCustomerCardProps) => {
    return (
        <div className="bg-secondary border border-theme p-6 rounded-xl mb-6 no-print shadow-xl">
            <h2 className="text-xl font-serif font-bold mb-4 text-primary-text flex items-center gap-2">
                👤 Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Box label="Customer Name" value={order.user?.name || 'N/A'} />
                <Box label="Email Address" value={order.user?.email || 'N/A'} mono />
                <Box label="Phone Number" value={order.shippingAddress?.phone || order.user?.phone || 'N/A'} />
                <Box label="Customer ID" value={order.user?._id || 'N/A'} mono small />
                {order.user?.companyName && <Box label="Company" value={order.user.companyName} />}
                {order.user?.creditEnabled && (
                    <Box label="Credit Terms" value={`Net-${order.user.creditTermsDays || 0} · Limit ₹${order.user.creditLimit?.toLocaleString()}`} />
                )}
            </div>
        </div>
    );
};

const Box = ({ label, value, mono, small }: any) => (
    <div className="bg-bg-alt p-4 rounded-lg border border-theme">
        <p className="text-xs text-secondary-text uppercase tracking-wider mb-2 font-bold">{label}</p>
        <p className={`text-primary-text font-bold ${mono ? 'font-mono' : ''} ${small ? 'text-xs' : 'text-lg'}`}>{value}</p>
    </div>
);

export default AdminCustomerCard;
