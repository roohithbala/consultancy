import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
    const [isExpanded, setIsExpanded] = useState(true); // Desktop expand/collapse

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    ];

    return (
        <div className="flex h-screen bg-black text-gray-200 font-sans selection:bg-gold selection:text-black transition-colors duration-300 overflow-hidden relative">

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-card/90 backdrop-blur-md border-b border-theme z-50 p-4 flex justify-between items-center shadow-lg">
                <span className="text-xl font-bold font-serif tracking-widest text-primary">ZAIN <span className="text-gold">ADMIN</span></span>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-primary hover:text-gold transition-colors">
                        {isSidebarOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Sidebar (Desktop & Mobile) */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-40 
                    ${isExpanded ? 'md:w-72' : 'md:w-20'} 
                    w-72 bg-card/80 backdrop-blur-xl border-r border-theme transform transition-all duration-500 ease-in-out 
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    shadow-2xl flex flex-col z-10 m-0 md:m-4 md:rounded-2xl border-y md:border-l
                `}
            >
                {/* Sidebar Header */}
                <div className="p-6 flex items-center justify-between border-b border-theme/50 min-h-[88px]">
                    {isExpanded ? (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold font-serif tracking-widest text-primary">ZAIN</h2>
                            <p className="text-[10px] text-gold tracking-[0.3em] font-sans uppercase">Admin Console</p>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center">
                            <span className="text-2xl font-bold font-serif text-gold">Z</span>
                        </div>
                    )}

                    {/* Desktop Toggle Button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="hidden md:flex p-1.5 rounded-full hover:bg-gold/10 text-secondary hover:text-gold transition-colors"
                    >
                        <ChevronRight size={16} className={`transform transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-none">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                                    ${isActive
                                        ? 'bg-gradient-to-r from-gold to-yellow-600 text-black shadow-lg shadow-gold/20 font-bold'
                                        : 'hover:bg-secondary/10 text-secondary hover:text-primary'}
                                `}
                            >
                                <item.icon size={20} className={`${isActive ? 'text-black' : 'text-gold group-hover:scale-110 transition-transform'}`} />

                                <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-14'}`}>
                                    {item.label}
                                </span>

                                {!isExpanded && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-gold/20 shadow-xl">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-theme/50">
                    <button
                        onClick={handleLogout}
                        className={`
                            flex items-center gap-4 px-4 py-3 w-full rounded-xl text-left text-red-500 hover:bg-red-500/10 transition-all group
                            ${!isExpanded && 'justify-center'}
                        `}
                    >
                        <LogOut size={20} className="group-hover:translate-x-[-2px] transition-transform" />
                        {isExpanded && <span className="font-bold text-sm tracking-wide">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-20 md:pt-0 p-4 md:p-6 z-10 relative">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
