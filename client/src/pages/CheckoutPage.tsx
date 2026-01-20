import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { clearCart } from '../store/cartSlice';
import { CheckCircle, Truck, MapPin } from 'lucide-react';

const CheckoutPage = () => {
    const { cartItems, totalAmount } = useSelector((state: RootState) => state.cart);
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('BillDesk'); // Default
    const [deliveryMethod, setDeliveryMethod] = useState<'Courier' | 'Pickup'>('Courier'); // Default
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [utrNumber, setUtrNumber] = useState('');

    const [orderId, setOrderId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        zip: '',
        country: 'India',
        companyName: user?.companyName || ''
    });

    // Fetch addresses when modal opens
    const fetchAddresses = async () => {
        if (!user) return;
        try {
            const res = await fetch('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setSavedAddresses(data.addresses || []);
        } catch (error) {
            console.error(error);
        }
    };

    const selectAddress = (addr: any) => {
        setFormData(prev => ({
            ...prev,
            address: addr.street,
            city: addr.city,
            zip: addr.postalCode,
            country: addr.country
        }));
        setShowAddressModal(false);
    };

    if (showAddressModal && savedAddresses.length === 0) {
        fetchAddresses();
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Please sign in to place an order');
            navigate('/login');
            return;
        }

        if (paymentMethod === 'BankTransfer' && !utrNumber.trim()) {
            alert('Please enter the UTR/Transaction Reference Number.');
            return;
        }

        setLoading(true);

        const orderData = {
            orderItems: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                image: item.image,
                price: item.price,
                product: item.id,
                materialType: item.materialType,
                type: item.type,
                customization: item.customization,
                relatedSampleId: item.relatedSampleId,
                isRiskAccepted: item.isRiskAccepted
            })),
            shippingAddress: {
                address: formData.address,
                city: formData.city,
                postalCode: formData.zip,
                country: formData.country,
                phone: formData.phone
            },
            paymentMethod: paymentMethod,
            itemsPrice: totalAmount,
            shippingPrice: 0,
            taxPrice: Math.round(totalAmount * 0.18),
            totalPrice: Math.round(totalAmount * 1.18),
            isPaid: paymentMethod === 'BillDesk',
            paidAt: paymentMethod === 'BillDesk' ? new Date() : undefined,
            paymentResult: paymentMethod === 'BankTransfer' ? {
                id: utrNumber,
                status: 'Pending Verification',
                update_time: new Date().toISOString()
            } : {}
        };

        try {
            // 1. Simulate Payment Delay if BillDesk
            if (paymentMethod === 'BillDesk') {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate Redirect
            }

            // 2. Create Order
            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                const order = await res.json();
                setOrderId(order._id);
                dispatch(clearCart());
                setStep(2);
            } else {
                const error = await res.json();
                alert(error.message || 'Order failed');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && step === 1) {
        return (
            <div className="min-h-screen pt-20 pb-12 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                    <button onClick={() => navigate('/products')} className="text-accent underline">Browse Products</button>
                </div>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="min-h-screen pt-20 pb-12 bg-gray-50 flex items-center justify-center">
                <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
                    {orderId && <p className="text-sm font-bold text-gray-800 mb-2">Order ID: {orderId}</p>}
                    <p className="text-gray-600 mb-6">
                        Thank you, {formData.name}. Your order has been placed. We have sent a confirmation email to <b>{formData.email}</b>.
                        {paymentMethod === 'BillDesk' && ' Payment was successful.'}
                    </p>

                    {paymentMethod === 'BankTransfer' && (
                        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-8 text-left">
                            <h3 className="font-bold text-lg mb-3">Bank Transfer Details</h3>
                            <p className="text-sm text-gray-600 mb-2">Please transfer the total amount to the following account:</p>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-semibold w-24 inline-block">Account Name:</span> ZAIN FABRICS</p>
                                <p><span className="font-semibold w-24 inline-block">Account No:</span> 123456789012</p>
                                <p><span className="font-semibold w-24 inline-block">IFSC Code:</span> HDFC0001234</p>
                                <p><span className="font-semibold w-24 inline-block">Bank Name:</span> HDFC Bank, Perundurai</p>
                            </div>
                            <p className="text-xs text-amber-600 mt-3 font-semibold">Note: Your order will be processed once we verify the transaction.</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button onClick={() => window.print()} className="w-full border border-black text-black py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                            Print Order Summary
                        </button>
                        <button onClick={() => navigate('/')} className="w-full bg-black text-white py-3 rounded-lg font-bold">
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-12 bg-gray-50">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8">Checkout & Payment</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form */}
                    <div className="lg:w-2/3">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Shipping Address</h2>
                                <button type="button" onClick={() => setShowAddressModal(true)} className="text-sm text-accent underline font-bold">
                                    Select Saved Address
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name (Optional)</label>
                                        <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 border rounded-lg" required></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                        <select name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg">
                                            <option value="India">India</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                                        <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" required />
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <div className="mt-8">
                                        <h2 className="text-xl font-bold mb-4">Delivery Method</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div
                                                onClick={() => setDeliveryMethod('Courier')}
                                                className={`border rounded-lg p-4 cursor-pointer transition-all ${deliveryMethod === 'Courier' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${deliveryMethod === 'Courier' ? 'border-black' : 'border-gray-300'}`}>
                                                        {deliveryMethod === 'Courier' && <div className="w-2.5 h-2.5 bg-black rounded-full"></div>}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold flex items-center gap-2"><Truck size={16} /> Courier Delivery</p>
                                                        <p className="text-xs text-gray-500">Standard shipping rates apply</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                onClick={() => setDeliveryMethod('Pickup')}
                                                className={`border rounded-lg p-4 cursor-pointer transition-all ${deliveryMethod === 'Pickup' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${deliveryMethod === 'Pickup' ? 'border-black' : 'border-gray-300'}`}>
                                                        {deliveryMethod === 'Pickup' && <div className="w-2.5 h-2.5 bg-black rounded-full"></div>}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold flex items-center gap-2"><MapPin size={16} /> Self Pickup</p>
                                                        <p className="text-xs text-gray-500">Collect from our factory</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                                        <div className="space-y-3">
                                            {[
                                                { id: 'BillDesk', label: 'BillDesk (Credit/Debit/NetBanking)' },
                                                { id: 'BankTransfer', label: 'Direct Bank Transfer (Manual)' }
                                            ].map((method) => (
                                                <div key={method.id} className={`border rounded-lg transition-colors ${paymentMethod === method.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                                                    <label className="flex items-center gap-3 p-4 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="paymentMethod"
                                                            value={method.id}
                                                            checked={paymentMethod === method.id}
                                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                                            className="w-5 h-5 accent-black"
                                                        />
                                                        <span className="font-medium">{method.label}</span>
                                                    </label>

                                                    {/* UTR Input for Bank Transfer */}
                                                    {paymentMethod === 'BankTransfer' && method.id === 'BankTransfer' && (
                                                        <div className="px-4 pb-4 pl-12">
                                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                                UTR / Transaction Reference Number <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter the 12-digit UTR number"
                                                                value={utrNumber}
                                                                onChange={(e) => setUtrNumber(e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black uppercase tracking-wider"
                                                                required={paymentMethod === 'BankTransfer'}
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Please transfer the funds and enter the reference number here clearly.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                                            {loading ? 'Processing Order...' : 'Place Order'}
                                        </button>
                                    </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={`${item.id}-${item.type}`} className="flex gap-4 py-4 border-b border-gray-50 last:border-0">
                                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">{item.name}</h4>
                                            <p className="text-xs text-gray-500 capitalize">{item.materialType}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 capitalize">{item.type}</span>
                                                <span className="text-sm font-medium">Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold">
                                            ₹{item.price * item.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax (18% GST)</span>
                                    <span>₹{Math.round(totalAmount * 0.18)}</span>
                                </div>
                                {deliveryMethod === 'Pickup' && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Shipping</span>
                                        <span>FREE (Pickup)</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total Amount</span>
                                    <span>₹{Math.round(totalAmount * 1.18)}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Inclusive of all taxes.</p>
                                <p className="text-[10px] text-amber-600 mt-1 italic">
                                    * Approximate price. Final quote may vary based on customizations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Selection Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Select Saved Address</h3>
                            <button onClick={() => setShowAddressModal(false)} className="text-gray-500 hover:text-black">Close</button>
                        </div>
                        <div className="space-y-4">
                            {savedAddresses.length > 0 ? (
                                savedAddresses.map((addr, idx) => (
                                    <div key={idx} onClick={() => selectAddress(addr)} className="border p-4 rounded-lg cursor-pointer hover:border-black transition-colors">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold">{addr.addressType}</span>
                                            {addr.isDefault && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Default</span>}
                                        </div>
                                        <p className="text-sm text-gray-600">{addr.street}</p>
                                        <p className="text-sm text-gray-600">{addr.city}, {addr.postalCode}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">No saved addresses found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
