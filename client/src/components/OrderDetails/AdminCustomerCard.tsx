interface AdminCustomerCardProps {
    order: any;
}

const AdminCustomerCard = ({ order }: AdminCustomerCardProps) => {
    return (
        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/30 p-6 rounded-xl mb-6 no-print shadow-lg">
            <h2 className="text-xl font-serif font-bold mb-4 text-blue-400 flex items-center gap-2">
                👤 Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Box label="Customer Name" value={order.user?.name || 'N/A'} />
                <Box label="Email Address" value={order.user?.email || 'N/A'} mono />
                <Box label="Phone Number" value={order.shippingAddress?.phone || order.user?.phone || 'N/A'} />
                <Box label="Customer ID" value={order.user?._id || 'N/A'} mono small />
            </div>
        </div>
    );
};

const Box = ({ label, value, mono, small }: any) => (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{label}</p>
        <p className={`text-white font-bold ${mono ? 'font-mono' : ''} ${small ? 'text-xs' : 'text-lg'}`}>{value}</p>
    </div>
);

export default AdminCustomerCard;
