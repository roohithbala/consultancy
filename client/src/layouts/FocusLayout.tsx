import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import ThemeToggle from '../components/ThemeToggle';

const FocusLayout = () => {
    const { cartItems } = useSelector((state: RootState) => state.cart);

    return (
        <div className="min-h-screen flex flex-col bg-primary text-secondary transition-colors duration-300">
            <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-md border-b border-theme transition-colors duration-300 shadow-sm">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/products" className="flex items-center text-xs font-bold uppercase tracking-widest text-secondary hover:text-gold transition-colors">
                        <ArrowLeft size={16} className="mr-2" /> Back to Collection
                    </Link>

                    <Link to="/" className="text-xl font-bold tracking-widest text-primary font-serif">
                        ZAIN <span className="text-gold">FABRICS</span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <ThemeToggle />
                        <Link to="/cart" className="relative text-primary hover:text-gold transition-colors">
                            <ShoppingBag size={20} strokeWidth={1.5} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
};

export default FocusLayout;
