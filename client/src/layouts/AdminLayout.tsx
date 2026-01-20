import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X } from 'lucide-react';

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
        // Add more as needed
    ];

    return (
        <div className="flex h-screen bg-black text-gray-200 font-sans selection:bg-gold selection:text-black">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-black/90 backdrop-blur border-b border-white/10 z-50 p-4 flex justify-between items-center">
                <span className="text-xl font-bold font-serif tracking-widest text-white">ZAIN <span className="text-gold">ADMIN</span></span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
                    {isSidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-secondary border-r border-white/10 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-8 hidden md:block">
                        <h2 className="text-2xl font-bold font-serif tracking-widest text-white">ZAIN <span className="text-gold">ADMIN</span></h2>
                    </div>

                    <div className="md:hidden p-8 mt-12">
                        {/* Spacer for mobile header */}
                    </div>

                    <nav className="flex-1 px-4 space-y-2 mt-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-none border-l-2 border-transparent hover:border-gold hover:bg-white/5 text-gray-400 hover:text-white transition-all uppercase tracking-widest text-xs font-bold"
                            >
                                <item.icon size={18} /> {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-500/10 transition-colors uppercase tracking-widest text-xs font-bold"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 p-4 md:p-8 bg-black scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
