import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, ArrowRight, ShoppingBag, CreditCard, ShieldCheck, Edit2 } from 'lucide-react';
import type { RootState } from '../store';
import { removeFromCart, clearCart, updateCartItem } from '../store/cartSlice';

const CartPage = () => {
    const dispatch = useDispatch();
    const { cartItems } = useSelector((state: RootState) => state.cart);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.18; // 18% GST estimate
    const total = subtotal + tax;

    const removeHandler = (id: string, type?: 'regular' | 'sample') => {
        dispatch(removeFromCart({ id, type }));
    };

    const updateQuantity = (id: string, type: 'regular' | 'sample' | undefined, oldCustomization: string | undefined, newQty: number) => {
        if (!type || newQty < 1) return;
        if (type === 'regular' && newQty < 5) return; // Enforce Min 5m for regular
        dispatch(updateCartItem({ id, type, oldCustomization, newQuantity: newQty }));
    };

    const updateNote = (id: string, type: 'regular' | 'sample' | undefined, oldCustomization: string | undefined, newNote: string) => {
        if (!type) return;
        dispatch(updateCartItem({ id, type, oldCustomization, newCustomization: newNote }));
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-black text-white p-4 text-center font-sans">
                <div className="bg-white/5 p-8 rounded-full shadow-2xl mb-8 animate-pulse">
                    <ShoppingBag size={64} className="text-gold" strokeWidth={1} />
                </div>
                <h2 className="text-3xl font-serif font-bold mb-4 text-white">Your Requests are Empty</h2>
                <p className="text-gray-400 mb-10 max-w-md font-light text-lg">
                    Discover our exclusive collection of premium shoe materials.
                </p>
                <Link to="/products" className="bg-gold text-black px-10 py-4 rounded-none uppercase tracking-widest font-bold hover:bg-white transition-all transform hover:-translate-y-1">
                    Browse Collection
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen py-20 text-gray-200 font-sans selection:bg-gold selection:text-black">
            <div className="container mx-auto px-6 max-w-7xl">
                <h1 className="text-4xl font-serif font-bold mb-12 text-white">
                    Request <span className="text-gold">Summary</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Cart Items */}
                    <div className="flex-1">
                        <div className="space-y-6">
                            {cartItems.map((item, idx) => (
                                <div key={`${item.id}-${item.type}-${idx}`} className="group relative bg-white/5 border border-white/10 p-6 flex flex-col md:flex-row gap-6 hover:border-gold/30 transition-all duration-300">
                                    {/* Image */}
                                    <div className="w-full md:w-32 h-32 bg-gray-900 overflow-hidden relative flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        {item.type === 'sample' && (
                                            <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] uppercase font-bold px-2 py-1 tracking-wider">
                                                Sample
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1 font-serif">{item.name}</h3>
                                                <p className="text-sm text-gold uppercase tracking-wider">{item.materialType}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gold text-lg">₹{item.price * item.quantity}</p>
                                                <p className="text-xs text-gray-500">₹{item.price} / {item.type === 'sample' ? 'pc' : 'm'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            {/* Quantity Control */}
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Quantity ({item.type === 'sample' ? 'Units' : 'Meters'})</label>
                                                {item.type === 'regular' ? (
                                                    <div className="flex items-center bg-white/10 border border-white/20 w-max">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.type, item.customization, item.quantity - 5)}
                                                            className="px-3 py-2 hover:bg-white/10 transition-colors text-white"
                                                        >-</button>
                                                        <input
                                                            type="text"
                                                            value={item.quantity}
                                                            readOnly
                                                            className="w-12 text-center bg-transparent border-none text-white font-bold text-sm focus:outline-none"
                                                        />
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.type, item.customization, item.quantity + 5)}
                                                            className="px-3 py-2 hover:bg-white/10 transition-colors text-white"
                                                        >+</button>
                                                    </div>
                                                ) : (
                                                    <span className="text-white font-bold text-sm">1 Unit</span>
                                                )}
                                            </div>

                                            {/* Customization Note */}
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                                                    Customization Notes <Edit2 size={10} />
                                                </label>
                                                <textarea
                                                    className="w-full bg-white/5 border border-white/10 text-gray-300 text-xs p-2 focus:border-gold focus:bg-white/10 transition-all outline-none rounded resize-none"
                                                    rows={2}
                                                    value={item.customization || ''}
                                                    onChange={(e) => updateNote(item.id, item.type, item.customization, e.target.value)}
                                                    placeholder="Add notes here (e.g. stiffness, color shade)..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={() => removeHandler(item.id, item.type)}
                                        className="text-gray-500 hover:text-red-500 transition-colors p-2 self-start md:self-center"
                                        title="Remove Item"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <Link to="/products" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest transition-colors">
                                <ArrowRight size={16} className="rotate-180" /> Continue Shopping
                            </Link>
                            <button onClick={() => dispatch(clearCart())} className="text-red-500/70 hover:text-red-500 text-xs uppercase tracking-widest transition-colors">
                                Clear Request List
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white/5 border border-white/10 p-8 sticky top-24 backdrop-blur-md">
                            <h2 className="text-xl font-serif font-bold text-white mb-8 border-b border-white/10 pb-4">Estimated Cost</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>GST (18%)</span>
                                    <span className="text-white">₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-xl text-gold">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <Link to="/checkout" className="w-full bg-gold text-black py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all group">
                                Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-3 text-gray-500 text-xs">
                                    <ShieldCheck size={16} className="text-gold" />
                                    <span>Secure checkout powered by BillDesk</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500 text-xs">
                                    <CreditCard size={16} className="text-gold" />
                                    <span>Bank Transfer (UTR) Accepted</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
