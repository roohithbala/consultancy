import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import type { RootState } from '../store';
import { removeFromCart, clearCart } from '../store/cartSlice';

const CartPage = () => {
    const dispatch = useDispatch();
    const { cartItems } = useSelector((state: RootState) => state.cart);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.18; // 18% GST estimate
    const total = subtotal + tax;

    const removeHandler = (id: string, type?: 'regular' | 'sample') => {
        dispatch(removeFromCart({ id, type }));
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                    <ShoppingBag size={48} className="text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Your Order List is Empty</h2>
                <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added any fabrics to your order request yet.</p>
                <Link to="/products" className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
                    Browse Collection
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Request Order Summary</h1>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Cart Items */}
                    <div className="flex-1">
                        <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm uppercase hidden md:table-header-group">
                                    <tr>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Quantity</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cartItems.map((item) => (
                                        <tr key={item.id} className="flex flex-col md:table-row">
                                            <td className="px-6 py-4 md:w-1/2">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">
                                                            {item.name}
                                                            {item.type === 'sample' && <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Sample</span>}
                                                        </h3>
                                                        <p className="text-xs text-gray-500">{item.materialType}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 md:py-4 flex justify-between md:table-cell">
                                                <span className="md:hidden font-bold text-gray-500 text-sm">Price:</span>
                                                <span className="font-medium">₹{item.price}</span>
                                            </td>
                                            <td className="px-6 py-2 md:py-4 flex justify-between md:table-cell">
                                                <span className="md:hidden font-bold text-gray-500 text-sm">Qty:</span>
                                                <span className="px-3 py-1 bg-gray-100 rounded-md text-sm">{item.quantity} m</span>
                                            </td>
                                            <td className="px-6 py-2 md:py-4 flex justify-between md:table-cell">
                                                <span className="md:hidden font-bold text-gray-500 text-sm">Total:</span>
                                                <span className="font-bold">₹{item.price * item.quantity}</span>
                                            </td>
                                            <td className="px-6 py-2 md:py-4 text-right md:text-center">
                                                <button onClick={() => removeHandler(item.id, item.type)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                            <Link to="/products" className="text-gray-500 hover:text-black flex items-center gap-2">
                                <ArrowRight size={16} className="rotate-180" /> Continue Shopping
                            </Link>
                            <button onClick={() => dispatch(clearCart())} className="text-red-500 text-sm hover:underline">
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-96">
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-24">
                            <h2 className="text-lg font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>GST (18% Est.)</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg">
                                    <span>Total Estimate</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button className="w-full bg-black text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                                Proceed to Checkout <ArrowRight size={18} />
                            </button>

                            <p className="text-xs text-gray-400 mt-4 text-center">
                                Secure checkout process. Actual shipping and taxes calculated at next step.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
