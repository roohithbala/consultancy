import { DollarSign, ShoppingBag, Package, Users, TrendingUp } from 'lucide-react';

interface StatsGridProps {
    stats: {
        totalSales: number;
        activeOrders: number;
        totalProducts: number;
        totalUsers: number;
    };
}

const StatsGrid = ({ stats }: StatsGridProps) => {
    const statConfigs = [
        { title: 'Total Sales', value: stats.totalSales ? `₹${stats.totalSales.toLocaleString()}` : '₹0', icon: DollarSign, color: 'text-green-400' },
        { title: 'Active Orders', value: stats.activeOrders || 0, icon: ShoppingBag, color: 'text-blue-400' },
        { title: 'Products', value: stats.totalProducts || 0, icon: Package, color: 'text-purple-400' },
        { title: 'Customers', value: stats.totalUsers || 0, icon: Users, color: 'text-orange-400' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statConfigs.map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-gold/30 transition-all duration-300 group shadow-sm hover:shadow-gold/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 bg-white/5 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <TrendingUp size={16} className="text-green-500" />
                    </div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.title}</h3>
                    <p className="text-2xl font-bold text-white mt-1 group-hover:text-gold transition-colors">{stat.value}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;
