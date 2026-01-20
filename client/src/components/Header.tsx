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
        <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-md border-b border-theme transition-all duration-300 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to={user ? "/products" : "/"} className="text-2xl font-bold tracking-widest text-primary uppercase font-serif">
                    ZAIN <span className="text-gold">FABRICS</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-10">
                    {user ? (
                        <>
                            {user?.role === 'admin' ? (
                                <>
                                    <Link to="/admin" className="text-xs font-bold tracking-[0.2em] text-gold hover:text-primary transition-colors uppercase">Dashboard</Link>
                                    <Link to="/admin/orders" className="text-xs font-bold tracking-[0.2em] text-secondary hover:text-gold transition-colors uppercase">All Orders</Link>
                                    <Link to="/admin/products" className="text-xs font-bold tracking-[0.2em] text-secondary hover:text-gold transition-colors uppercase">Products</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/products" className="text-xs font-bold tracking-[0.2em] text-secondary hover:text-gold transition-colors uppercase">Collection</Link>
                                    <Link to="/orders" className="text-xs font-bold tracking-[0.2em] text-secondary hover:text-gold transition-colors uppercase">My Orders</Link>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to="/" className="text-xs font-bold tracking-[0.2em] text-secondary hover:text-gold transition-colors uppercase">Home</Link>
                            <Link to="/products" className="text-xs font-bold tracking-[0.2em] text-secondary hover:text-gold transition-colors uppercase">Collections</Link>
                            <Link to="/about" className="text-xs font-bold tracking-[0.2em] text-secondary hover:text-gold transition-colors uppercase">About</Link>
                            <Link to="/contact" className="text-xs font-bold tracking-[0.2em] text-secondary hover:text-gold transition-colors uppercase">Contact</Link>
                        </>
                    )}
                </nav>

                <div className="flex items-center space-x-6 text-primary">
                    <ThemeToggle />

                    {user?.role !== 'admin' && (
                        <>
                            <button className="hover:text-gold transition-colors">
                                <Search size={20} strokeWidth={1.5} />
                            </button>

                            <Link to="/cart" className="relative hover:text-gold transition-colors">
                                <ShoppingBag size={20} strokeWidth={1.5} />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>
                        </>
                    )}

                    {user ? (
                        <div className="flex items-center gap-6 pl-6 border-l border-theme">
                            {user?.role !== 'admin' && (
                                <Link to="/orders" className="hidden lg:block text-xs font-bold tracking-widest hover:text-gold transition-colors uppercase">
                                    Orders
                                </Link>
                            )}
                            <div className="flex items-center gap-2 group cursor-pointer relative">
                                <Link to="/profile" className="flex items-center gap-2 group-hover:text-gold transition-colors">
                                    <User size={20} strokeWidth={1.5} />
                                    <span className="text-xs font-medium hidden lg:block tracking-wide">{user?.name?.split(' ')[0]}</span>
                                </Link>

                                <button onClick={handleLogout} className="ml-4 text-secondary hover:text-red-500 transition-colors" title="Logout">
                                    <LogOut size={18} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="hover:text-gold transition-colors">
                            <User size={20} strokeWidth={1.5} />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
