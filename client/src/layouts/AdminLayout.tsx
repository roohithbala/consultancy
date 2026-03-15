import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Package, ShoppingBag, LogOut, Menu, X, ChevronRight, BarChart2, Receipt, Building2, FileText, Activity } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // On desktop: sidebar is always expanded by default
    // On mobile: sidebar is hidden by default (slide-in drawer)
    const [isExpanded, setIsExpanded] = useState(true);   // desktop collapse/expand
    const [mobileOpen, setMobileOpen] = useState(false);  // mobile drawer toggle

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = [
        { path: '/admin',            icon: BarChart2,       label: 'Analytics' },
        { path: '/admin/products',   icon: Package,         label: 'Products' },
        { path: '/admin/orders',     icon: ShoppingBag,     label: 'Orders' },
        { path: '/admin/customers',  icon: Building2,       label: 'Customers' },
        { path: '/admin/billing',    icon: Receipt,         label: 'Billing' },
        { path: '/admin/activity',   icon: Activity,        label: 'User Logs' },
        { path: '/admin/reports',    icon: FileText,        label: 'Reports' },
    ];

    const sidebarWidth = isExpanded ? 'md:w-72' : 'md:w-20';

    return (
        <div className="flex h-screen bg-bg-main text-primary-text font-sans overflow-hidden transition-colors duration-300">

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            {/*
              Desktop: always visible, togglable between wide (72) and icon-only (20).
              Mobile:  full-width drawer that slides in from left when mobileOpen=true.
              There is NO separate top navbar — the sidebar is the single nav surface.
            */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    w-72 ${sidebarWidth}
                    bg-primary border-r border-theme
                    flex flex-col
                    shadow-2xl
                    transition-all duration-300 ease-in-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    md:relative md:flex md:translate-x-0
                    md:m-4 md:rounded-2xl md:border md:h-auto
                `}
            >
                {/* Sidebar header */}
                <div className="flex items-center justify-between px-5 py-5 border-b border-theme min-h-[72px]">
                    {isExpanded ? (
                        <div>
                            <h2 className="text-xl font-black font-serif tracking-widest text-primary-text">ZAIN</h2>
                            <p className="text-[9px] text-brand tracking-[0.3em] font-black uppercase mt-0.5">Admin Console</p>
                        </div>
                    ) : (
                        <span className="text-xl font-black font-serif text-brand mx-auto">Z</span>
                    )}

                    {/* Desktop collapse button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="hidden md:flex p-1.5 rounded-full hover:bg-brand/10 text-secondary-text hover:text-brand transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <ChevronRight
                            size={16}
                            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                        />
                    </button>

                    {/* Mobile close button */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="md:hidden p-1.5 rounded-full hover:bg-brand/10 text-secondary-text hover:text-brand transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive =
                            location.pathname === item.path ||
                            (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={`
                                    relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-visible
                                    ${isActive
                                        ? 'bg-brand text-black font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand/20'
                                        : 'hover:bg-brand/5 text-secondary-text hover:text-primary-text'}
                                `}
                            >
                                <item.icon
                                    size={20}
                                    strokeWidth={isActive ? 3 : 2}
                                    className={`flex-shrink-0 ${isActive ? 'text-black' : 'text-brand/70 group-hover:text-brand group-hover:scale-110 transition-all'}`}
                                />
                                <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                                    {item.label}
                                </span>

                                {/* Tooltip when collapsed (desktop only) */}
                                {!isExpanded && (
                                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-primary border border-brand/20 text-primary-text text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl hidden md:block">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar footer */}
                <div className="p-3 border-t border-theme flex flex-col gap-2">
                    <div className={`flex ${isExpanded ? 'justify-start' : 'justify-center'} px-1`}>
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-left text-red-500 hover:bg-red-500/10 transition-all group ${!isExpanded ? 'justify-center' : ''}`}
                    >
                        <LogOut size={18} className="flex-shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                        {isExpanded && <span className="font-bold text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Main content area ───────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile-only top strip — just a hamburger + title, no full nav */}
                <div className="md:hidden flex items-center gap-4 px-4 py-3 border-b border-theme bg-primary flex-shrink-0">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 rounded-lg hover:bg-brand/10 text-primary-text hover:text-brand transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>
                    <span className="text-lg font-black font-serif tracking-widest text-primary-text">
                        ZAIN <span className="text-brand italic font-normal">Admin</span>
                    </span>
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-bg-main transition-colors duration-200">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
