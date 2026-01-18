import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';

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
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to={user ? "/products" : "/"} className="text-2xl font-bold tracking-tighter text-gray-900">
                    ZAIN <span className="text-accent">FABRICS</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                    {user ? (
                        <>
                            <Link to="/products" className="text-sm font-medium hover:text-accent transition-colors">SHOP ALL</Link>
                            <Link to="/products?category=inlines" className="text-sm font-medium hover:text-accent transition-colors">INLINES</Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-sm font-medium hover:text-accent transition-colors">ADMIN DASHBOARD</Link>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to="/" className="text-sm font-medium hover:text-accent transition-colors">HOME</Link>
                            <Link to="/products" className="text-sm font-medium hover:text-accent transition-colors">COLLECTIONS</Link>
                            <Link to="/about" className="text-sm font-medium hover:text-accent transition-colors">ABOUT</Link>
                            <Link to="/contact" className="text-sm font-medium hover:text-accent transition-colors">CONTACT</Link>
                            <button onClick={() => alert("Simra Fabrics website is coming soon!")} className="text-sm font-medium hover:text-accent transition-colors text-gray-500">SIMRA FABRICS</button>
                        </>
                    )}
                </nav>

                {/* Icons */}
                <div className="flex items-center space-x-6">
                    <div className="hidden md:flex items-center space-x-6">
                        <div className="relative group">
                            <button className="hover:text-accent transition-colors">
                                <Search size={20} />
                            </button>
                        </div>

                        <Link to="/cart" className="relative hover:text-accent transition-colors">
                            <ShoppingBag size={20} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Hello, {user.name}</span>
                                <button onClick={handleLogout} className="hover:text-red-500 transition-colors" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="hover:text-accent transition-colors">
                                <User size={20} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
