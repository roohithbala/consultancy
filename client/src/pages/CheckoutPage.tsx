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
    const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // Default
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

    const handleRazorpayPayment = async (orderData: any) => {
        setLoading(true);
        try {
            // 1. Create PRELIMINARY Unpaid Order in Database
            const createOrderRes = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({
                    ...orderData,
                    isPaid: false,
                    paymentMethod: 'Razorpay'
                }),
            });

            if (!createOrderRes.ok) {
                const errorData = await createOrderRes.json();
                throw new Error(errorData.message || 'Failed to create initial order');
            }
            const localOrder = await createOrderRes.json();

            // 2. Create Razorpay Order on Server
            const rzpOrderRes = await fetch('http://localhost:5000/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({
                    amount: orderData.totalPrice,
                    currency: 'INR',
                    receipt: `receipt_${localOrder._id.substring(0, 10)}`
                }),
            });

            if (!rzpOrderRes.ok) {
                const rzpError = await rzpOrderRes.json();
                throw new Error(rzpError.message || 'Failed to create Razorpay secure order');
            }
            const rzpOrder = await rzpOrderRes.json();

            const options = {
                key: 'rzp_test_SNdsdABBAFJsIo',
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: 'Zain Fabrics',
                description: `Order ID: ${localOrder._id}`,
                order_id: rzpOrder.id,
                handler: async (response: any) => {
                    setLoading(true);
                    // 3. Verify Payment
                    const verifyRes = await fetch('http://localhost:5000/api/payment/verify-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${user?.token}`,
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: localOrder._id
                        }),
                    });

                    if (verifyRes.ok) {
                        setOrderId(localOrder._id);
                        dispatch(clearCart());
                        setStep(2);
                    } else {
                        await verifyRes.json();
                        alert('Payment verification failed, please contact support with Order ID: ' + localOrder._id);
                    }
                    setLoading(false);
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: '#D4AF37'
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        // Optional: show a message about the pending unpaid order
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Razorpay payment failed to initiate');
            setLoading(false);
        }
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

        const orderData = {
            orderItems: cartItems.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                image: item.image,
                price: item.price,
                product: item.id,
                materialType: item.materialType,
                type: item.type || 'regular',
                customization: item.customization,
                color: item.color,
                relatedSampleId: item.relatedSampleId || undefined,
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
            deliveryMethod: deliveryMethod,
            itemsPrice: totalAmount,
            shippingPrice: 0,
            taxPrice: Math.round(totalAmount * 0.18),
            totalPrice: Math.round(totalAmount * 1.18)
        };

        if (paymentMethod === 'Razorpay') {
            await handleRazorpayPayment(orderData);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    ...orderData,
                    isPaid: paymentMethod === 'COD', // COD is considered paid on delivery
                    paidAt: paymentMethod === 'COD' ? new Date() : undefined,
                    paymentResult: paymentMethod === 'BankTransfer' ? {
                        id: utrNumber,
                        status: 'Pending Verification',
                        update_time: new Date().toISOString()
                    } : {}
                }),
            });

            if (res.ok) {
                const order = await res.json();
                setOrderId(order._id);
                dispatch(clearCart());
                setStep(2);
            } else {
                alert('Order placement failed');
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
            <div className="min-h-screen pt-20 pb-12 bg-primary flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-primary">Your cart is empty</h2>
                    <button onClick={() => navigate('/products')} className="text-gold underline">Browse Products</button>
                </div>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="min-h-screen pt-20 pb-12 bg-primary flex items-center justify-center transition-colors duration-300">
                <div className="max-w-xl w-full bg-card p-8 rounded-xl shadow-lg text-center border border-theme">
                    <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-primary font-serif">Order Placed Successfully!</h2>
                    {orderId && <p className="text-sm font-bold text-secondary mb-2">Order ID: {orderId}</p>}
                    <p className="text-secondary mb-6">
                        Thank you, {formData.name}. Your order has been placed. We have sent a confirmation email to <b>{formData.email}</b>.
                        {paymentMethod === 'Razorpay' && ' Payment was successful via Razorpay Secure.'}
                    </p>

                    {paymentMethod === 'BankTransfer' && (
                        <div className="bg-secondary border border-theme p-6 rounded-lg mb-8 text-left">
                            <h3 className="font-bold text-lg mb-3 text-primary">Bank Transfer Details</h3>
                            <p className="text-sm text-secondary mb-2">Please transfer the total amount to the following account:</p>
                            <div className="space-y-1 text-sm text-secondary">
                                <p><span className="font-semibold w-24 inline-block text-primary">Account Name:</span> ZAIN FABRICS</p>
                                <p><span className="font-semibold w-24 inline-block text-primary">Account No:</span> 123456789012</p>
                                <p><span className="font-semibold w-24 inline-block text-primary">IFSC Code:</span> HDFC0001234</p>
                                <p><span className="font-semibold w-24 inline-block text-primary">Bank Name:</span> HDFC Bank, Perundurai</p>
                            </div>
                            <p className="text-xs text-amber-500 mt-3 font-semibold">Note: Your order will be processed once we verify the transaction.</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={() => window.print()} 
                            className="w-full border-2 border-theme text-primary-text py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-secondary hover:border-brand/30 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <span className="opacity-70">Print Order Summary</span>
                        </button>
                        <button 
                            onClick={() => navigate('/')} 
                            className="w-full bg-brand text-black py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative z-10">Return to Home</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-12 bg-primary transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 font-serif text-primary">Checkout & Payment</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form */}
                    <div className="lg:w-2/3">
                        <div className="bg-card p-8 rounded-xl shadow-lg border border-theme">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-primary font-serif">Shipping Address</h2>
                                <button type="button" onClick={() => setShowAddressModal(true)} className="text-sm text-gold underline font-bold hover:text-yellow-400">
                                    Select Saved Address
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-2">Full Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary border border-theme rounded-lg text-primary focus:border-gold focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-2">Company Name (Optional)</label>
                                        <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary border border-theme rounded-lg text-primary focus:border-gold focus:outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-2">Email <span className="text-red-500">*</span></label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary border border-theme rounded-lg text-primary focus:border-gold focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-2">Phone <span className="text-red-500">*</span></label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary border border-theme rounded-lg text-primary focus:border-gold focus:outline-none" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">Address <span className="text-red-500">*</span></label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-secondary border border-theme rounded-lg text-primary focus:border-gold focus:outline-none" required></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-secondary mb-2">Country</label>
                                        <select name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary border border-theme rounded-lg text-primary focus:border-gold focus:outline-none">
                                            <option value="India">India</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-secondary mb-2">City <span className="text-red-500">*</span></label>
                                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary border border-theme rounded-lg text-primary focus:border-gold focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-2">ZIP Code <span className="text-red-500">*</span></label>
                                        <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary border border-theme rounded-lg text-primary focus:border-gold focus:outline-none" required />
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h2 className="text-xl font-bold mb-4 text-primary font-serif">Delivery Method</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setDeliveryMethod('Courier')}
                                            className={`border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${deliveryMethod === 'Courier' ? 'border-brand bg-brand/5 shadow-md shadow-brand/5' : 'border-theme hover:border-brand/30 bg-secondary/30'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${deliveryMethod === 'Courier' ? 'border-brand bg-brand/10' : 'border-theme'}`}>
                                                    {deliveryMethod === 'Courier' && <div className="w-2.5 h-2.5 bg-brand rounded-full animate-scale-in"></div>}
                                                </div>
                                                <div>
                                                    <p className={`font-black uppercase tracking-[0.1em] text-xs flex items-center gap-2 transition-colors ${deliveryMethod === 'Courier' ? 'text-primary-text' : 'text-secondary-text'}`}>
                                                        <Truck size={16} strokeWidth={2.5} className="text-brand" /> Courier Delivery
                                                    </p>
                                                    <p className="text-[10px] font-bold text-secondary-text/60 mt-1">Standard shipping rates apply</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setDeliveryMethod('Pickup')}
                                            className={`border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${deliveryMethod === 'Pickup' ? 'border-brand bg-brand/5 shadow-md shadow-brand/5' : 'border-theme hover:border-brand/30 bg-secondary/30'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${deliveryMethod === 'Pickup' ? 'border-brand bg-brand/10' : 'border-theme'}`}>
                                                    {deliveryMethod === 'Pickup' && <div className="w-2.5 h-2.5 bg-brand rounded-full animate-scale-in"></div>}
                                                </div>
                                                <div>
                                                    <p className={`font-black uppercase tracking-[0.1em] text-xs flex items-center gap-2 transition-colors ${deliveryMethod === 'Pickup' ? 'text-primary-text' : 'text-secondary-text'}`}>
                                                        <MapPin size={16} strokeWidth={2.5} className="text-brand" /> Self Pickup
                                                    </p>
                                                    <p className="text-[10px] font-bold text-secondary-text/60 mt-1">Collect from our factory</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h2 className="text-xl font-bold mb-4 text-primary font-serif">Payment Method</h2>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'Razorpay', label: 'Razorpay (Credit/Debit/UPI/NetBanking)' },
                                            { id: 'BankTransfer', label: 'Direct Bank Transfer (Manual)' }
                                        ].map((method) => (
                                            <div key={method.id} className={`border rounded-lg transition-colors ${paymentMethod === method.id ? 'border-gold bg-secondary/50' : 'border-theme hover:border-gold/50'}`}>
                                                <label className="flex items-center gap-3 p-4 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value={method.id}
                                                        checked={paymentMethod === method.id}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="w-5 h-5 accent-gold"
                                                    />
                                                    <span className="font-medium text-primary">{method.label}</span>
                                                </label>

                                                {/* UTR Input for Bank Transfer */}
                                                {paymentMethod === 'BankTransfer' && method.id === 'BankTransfer' && (
                                                    <div className="px-4 pb-4 pl-4 md:pl-12 space-y-4">
                                                        <div className="bg-secondary/20 p-4 rounded border border-theme text-sm text-secondary">
                                                            <p className="font-bold text-primary mb-2">Account Details:</p>
                                                            <p>Account Name: <span className="text-primary font-bold">ZAIN FABRICS</span></p>
                                                            <p>Account No: <span className="text-primary font-bold">123456789012</span></p>
                                                            <p>IFSC: <span className="text-primary font-bold">HDFC0001234</span></p>
                                                            <p>Bank: <span className="text-primary">HDFC Bank, Perundurai</span></p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-secondary mb-1">
                                                                UTR / Transaction Reference Number <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter the 12-digit UTR number"
                                                                value={utrNumber}
                                                                onChange={(e) => setUtrNumber(e.target.value)}
                                                                className="w-full px-4 py-2 bg-primary border border-theme rounded text-primary focus:border-gold focus:ring-1 focus:ring-gold uppercase tracking-wider focus:outline-none"
                                                                required={paymentMethod === 'BankTransfer'}
                                                            />
                                                            <p className="text-xs text-secondary mt-1">
                                                                Please transfer the funds and enter the reference number here clearly.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="w-full bg-brand text-black py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {loading ? 'Processing Order...' : 'Place Order'}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-card p-6 rounded-xl shadow-lg border border-theme sticky top-24">
                            <h2 className="text-xl font-bold mb-6 text-primary font-serif">Order Summary</h2>
                            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={`${item.id}-${item.type}`} className="flex gap-4 py-4 border-b border-theme last:border-0">
                                        <div className="w-16 h-16 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-primary">{item.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[10px] text-secondary capitalize">{item.materialType}</p>
                                                {item.color && (
                                                    <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-2">
                                                        <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: item.color }}></div>
                                                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-tighter">{item.color}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs bg-secondary px-2 py-0.5 rounded text-secondary capitalize border border-theme">{item.type}</span>
                                                <span className="text-sm font-medium text-primary">Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-primary">
                                            ₹{item.price * item.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-theme pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-secondary">
                                    <span>Subtotal</span>
                                    <span className="text-primary font-medium">₹{totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-sm text-secondary">
                                    <span>Tax (18% GST)</span>
                                    <span className="text-primary font-medium">₹{Math.round(totalAmount * 0.18)}</span>
                                </div>
                                {deliveryMethod === 'Pickup' && (
                                    <div className="flex justify-between text-sm text-green-500 font-bold">
                                        <span>Shipping</span>
                                        <span>FREE (Pickup)</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-theme text-primary">
                                    <span>Total Amount</span>
                                    <span className="text-gold">₹{Math.round(totalAmount * 1.18)}</span>
                                </div>
                                <p className="text-xs text-secondary mt-2">Inclusive of all taxes.</p>
                                <p className="text-[10px] text-amber-500 mt-1 italic">
                                    * Approximate price. Final quote may vary based on customizations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Selection Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card p-6 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-theme shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-primary font-serif">Select Saved Address</h3>
                            <button onClick={() => setShowAddressModal(false)} className="text-secondary hover:text-primary">Close</button>
                        </div>
                        <div className="space-y-4">
                            {(Array.isArray(savedAddresses) ? savedAddresses : []).length > 0 ? (
                                (Array.isArray(savedAddresses) ? savedAddresses : []).map((addr, idx) => (
                                    <div key={idx} onClick={() => selectAddress(addr)} className="border border-theme p-4 rounded-lg cursor-pointer hover:border-gold transition-colors bg-secondary/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-primary">{addr.addressType}</span>
                                            {addr.isDefault && <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded border border-gold/30">Default</span>}
                                        </div>
                                        <p className="text-sm text-secondary">{addr.street}</p>
                                        <p className="text-sm text-secondary">{addr.city}, {addr.postalCode}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-secondary py-4">No saved addresses found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
