const AdminDashboardPage = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Sales</h3>
                    <p className="text-3xl font-bold">₹0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Active Orders</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Products</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
                <div className="text-gray-500 text-center py-8">
                    No orders yet.
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
