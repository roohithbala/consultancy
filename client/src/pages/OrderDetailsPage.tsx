import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { CheckCircle, Truck, Clock, FileText, MapPin } from 'lucide-react';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const { user } = useSelector((state: RootState) => state.auth);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                const data = await res.json();
                setOrder(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, user]);

    if (loading) return <div className="p-20 text-center">Loading Order Details...</div>;
    if (!order) return <div className="p-20 text-center">Order not found</div>;

    const getStatusStep = (status: string) => {
        const steps = ['Pending', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered'];
        return steps.indexOf(status) + 1;
    };

    const currentStep = getStatusStep(order.status);

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Order #{order._id}</h1>
                <Link to="/products" className="text-accent hover:underline">Continue Shopping</Link>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Truck size={24} /> Tracking Timeline
                </h2>
                <div className="relative flex justify-between items-center w-full max-w-4xl mx-auto">
                    {/* Progress Bar background */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0"></div>
                    {/* Active Progress Bar */}
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-accent -z-0 transition-all duration-500"
                        style={{ width: `${(currentStep - 1) * 25}%` }}
                    ></div>

                    {['Ordered', 'Processing', 'Shipped', 'Out', 'Delivered'].map((step, index) => {
                        const active = index + 1 <= currentStep;
                        return (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${active ? 'border-accent bg-accent text-white' : 'border-gray-300 text-gray-300'}`}>
                                    {active ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                                </div>
                                <span className={`text-xs font-bold ${active ? 'text-black' : 'text-gray-400'}`}>{step}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Tracking History Log */}
                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold mb-4">Tracking Updates</h3>
                    <div className="space-y-4">
                        {order.trackingHistory && order.trackingHistory.length > 0 ? (
                            order.trackingHistory.map((history: any, idx: number) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <Clock size={16} className="mt-1 text-gray-500" />
                                    <div>
                                        <p className="font-semibold text-sm">{history.status}</p>
                                        <p className="text-xs text-gray-600">{history.description}</p>
                                        <p className="text-xs text-gray-400">{new Date(history.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No updates yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Shipping Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin size={18} /> Shipping Address</h3>
                    <p className="font-semibold">{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="mt-2 text-sm text-gray-600">Phone: {order.shippingAddress.phone}</p>
                </div>

                {/* Billing Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><FileText size={18} /> Billing Address</h3>
                    <p className="font-semibold">{order.billingAddress?.address || order.shippingAddress.address}</p>
                    <p>{order.billingAddress?.city || order.shippingAddress.city}, {order.billingAddress?.postalCode || order.shippingAddress.postalCode}</p>
                    <p>{order.billingAddress?.country || order.shippingAddress.country}</p>
                </div>

                {/* Payment Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-4">Payment Summary</h3>
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Method</span>
                        <span className="font-bold">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Items Total</span>
                        <span>₹{order.itemsPrice}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                        <span>Total</span>
                        <span>₹{order.totalPrice}</span>
                    </div>
                    {order.isPaid ? (
                        <div className="mt-4 bg-green-100 text-green-800 px-3 py-1 rounded text-center text-sm font-bold">
                            Paid on {new Date(order.paidAt).toLocaleDateString()}
                        </div>
                    ) : (
                        <div className="mt-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-center text-sm font-bold">
                            Payment Pending
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
