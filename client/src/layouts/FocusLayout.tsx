import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const FocusLayout = () => {
    const { cartItems } = useSelector((state: RootState) => state.cart);

    return (
        <div className="min-h-screen flex flex-col bg-primary text-secondary transition-colors duration-300">
            <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-md border-b border-theme transition-colors duration-300">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/products" className="flex items-center text-sm font-medium text-secondary hover:text-primary transition-colors">
                        <ArrowLeft size={18} className="mr-2" /> Back to Collection
                    </Link>

                    <Link to="/" className="text-xl font-bold tracking-tighter text-primary">
                        ZAIN <span className="text-gold">FABRICS</span>
                    </Link>

                    <Link to="/cart" className="relative hover:text-accent transition-colors">
                        <ShoppingBag size={20} />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                {cartItems.length}
                            </span>
                        )}
                    </Link>
                </div>
            </header>
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
};

export default FocusLayout;
