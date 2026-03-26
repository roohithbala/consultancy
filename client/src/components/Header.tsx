import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import ThemeToggle from './ThemeToggle';

const Header = () => {

    const { user } = useSelector((state: RootState) => state.auth);
    const { cartItems } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-primary bg-opacity-95 backdrop-blur-md border-b border-theme transition-colors duration-300 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to={user ? "/products" : "/"} className="text-2xl font-bold tracking-widest text-primary uppercase font-serif">
                    ZAIN <span className="text-brand">FABRICS</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-10">
                    {user ? (
                        <>
                            {user?.role === 'admin' ? (
                                <>
                                    <Link to="/admin" className="text-[10px] font-black tracking-[0.2em] text-brand hover:text-brand-dark transition-colors uppercase border border-brand/20 px-4 py-1.5 rounded-full bg-brand/5">Console</Link>
                                    <Link to="/admin/orders" className="text-[10px] font-black tracking-[0.2em] text-primary hover:text-brand transition-colors uppercase">Orders</Link>
                                    <Link to="/admin/customers" className="text-[10px] font-black tracking-[0.2em] text-primary hover:text-brand transition-colors uppercase">Customers</Link>
                                    <Link to="/admin/products" className="text-[10px] font-black tracking-[0.2em] text-primary hover:text-brand transition-colors uppercase">Products</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/products" className="text-[10px] font-black tracking-[0.2em] text-primary hover:text-brand transition-colors uppercase">Collection</Link>
                                    <Link to="/orders" className="text-[10px] font-black tracking-[0.2em] text-primary hover:text-brand transition-colors uppercase">My Orders</Link>
                                    <Link to="/support" className="text-[10px] font-black tracking-[0.2em] text-primary hover:text-brand transition-colors uppercase">Support</Link>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to="/" className="text-[10px] font-black tracking-[0.2em] text-primary hover:text-brand transition-colors uppercase">Home</Link>
                            <Link to="/products" className="text-[10px] font-black tracking-[0.2em] text-primary hover:text-brand transition-colors uppercase">Collections</Link>
                            <Link to="/about" className="text-[10px] font-black tracking-[0.2em] text-primary hover:text-brand transition-colors uppercase">About</Link>
                            <Link to="/contact" className="text-[10px] font-black tracking-[0.2em] text-primary hover:text-brand transition-colors uppercase">Contact</Link>
                        </>
                    )}
                </nav>

                <div className="flex items-center space-x-6 text-primary">
                    <ThemeToggle />

                    {user?.role !== 'admin' && (
                        <>
                            <button className="text-primary hover:text-brand transition-colors">
                                <Search size={20} strokeWidth={1.5} />
                            </button>

                            <Link to="/cart" className="relative text-primary hover:text-brand transition-colors">
                                <ShoppingBag size={20} strokeWidth={1.5} />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-brand text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-black shadow-sm shadow-brand/20">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>
                        </>
                    )}

                    {user ? (
                        <div className="flex items-center gap-6 pl-6 border-l border-theme">
                            {user?.role !== 'admin' && (
                                <div className="hidden lg:flex items-center gap-6">
                                    <Link to="/orders" className="text-[10px] font-black tracking-widest text-primary hover:text-brand transition-colors uppercase">
                                        Orders
                                    </Link>
                                    <Link to="/support" className="text-[10px] font-black tracking-widest text-primary hover:text-brand transition-colors uppercase">
                                        Support
                                    </Link>
                                </div>
                            )}
                            <div className="flex items-center gap-2 group cursor-pointer relative">
                                <Link to="/profile" className="flex items-center gap-2 text-primary group-hover:text-brand transition-colors">
                                    <User size={20} strokeWidth={1.5} />
                                    <span className="text-xs font-black hidden lg:block tracking-widest uppercase">{user?.name?.split(' ')[0]}</span>
                                </Link>

                                <button onClick={handleLogout} className="ml-4 text-secondary hover:text-red-500 transition-colors" title="Logout">
                                    <LogOut size={18} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="text-primary hover:text-brand transition-colors">
                            <User size={20} strokeWidth={1.5} />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
