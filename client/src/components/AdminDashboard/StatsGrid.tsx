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
        { title: 'Total Revenue', value: stats.totalSales ? `₹${stats.totalSales.toLocaleString()}` : '₹0', icon: DollarSign, color: 'text-brand' },
        { title: 'Active Collections', value: stats.activeOrders || 0, icon: ShoppingBag, color: 'text-emerald-500' },
        { title: 'Material Asset', value: stats.totalProducts || 0, icon: Package, color: 'text-brand' },
        { title: 'Client Network', value: stats.totalUsers || 0, icon: Users, color: 'text-emerald-600' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {statConfigs.map((stat, idx) => (
                <div key={idx} className="glass rounded-[2rem] p-8 hover:border-brand/40 transition-all duration-700 group shadow-2xl hover:-translate-y-2 border border-theme">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 bg-bg-alt rounded-2xl ${stat.color} group-hover:bg-brand/10 transition-all duration-500`}>
                            <stat.icon size={28} strokeWidth={1.5} />
                        </div>
                        <TrendingUp size={18} className="text-brand opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-secondary-text/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.title}</h3>
                    <p className="text-3xl font-black text-primary-text group-hover:text-brand transition-colors duration-500 tracking-tighter italic">{stat.value}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;
