import { Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderHeaderProps {
    orderId: string;
    createdAt: string;
    onPrint: () => void;
    isAdmin: boolean;
}

const OrderHeader = ({ orderId, createdAt, onPrint, isAdmin }: OrderHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 no-print gap-4">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary mb-2">
                    Order <span className="text-gold">#{orderId.substring(0, 8)}</span>
                </h1>
                <p className="text-secondary text-sm">
                    Placed on {new Date(createdAt).toLocaleDateString()}
                </p>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={onPrint}
                    className="bg-gold text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors shadow-lg shadow-gold/20"
                >
                    <Printer size={18} /> Download Invoice
                </button>
                {!isAdmin && (
                    <Link to="/products" className="text-secondary hover:text-gold transition-colors flex items-center text-sm font-bold uppercase tracking-widest border border-white/10 px-6 py-3 rounded-lg hover:border-gold">
                        Continue Shopping
                    </Link>
                )}
            </div>
        </div>
    );
};

export default OrderHeader;
