import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { CheckCircle, Truck, Printer, FileText, Save } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { COMPANY_DETAILS } from '../config/companyDetails';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const { user } = useSelector((state: RootState) => state.auth);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [adminLoading, setAdminLoading] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({ invoiceNumber: '', manualInvoiceUrl: '' });
    const [isEditingFinancials, setIsEditingFinancials] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState('');
    const [courierName, setCourierName] = useState('Blue Dart');

    // Helper function to get tracking URL
    const getTrackingUrl = (courier: string, trackingNumber: string) => {
        const urls: { [key: string]: string } = {
            'Blue Dart': `https://www.bluedart.com/tracking/${trackingNumber}`,
            'DTDC': `https://www.dtdc.in/tracking.asp?id=${trackingNumber}`,
            'Delhivery': `https://www.delhivery.com/track/package/${trackingNumber}`,
            'FedEx': `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`,
            'DHL': `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${trackingNumber}`,
            'India Post': `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?ConsignmentNumber=${trackingNumber}`,
            'Ecom Express': `https://ecomexpress.in/tracking/?awb=${trackingNumber}`,
            'Xpressbees': `https://www.xpressbees.com/shipment/tracking?awb=${trackingNumber}`
        };
        return urls[courier] || '#';
    };

    // Helper function to get valid next statuses (prevent rollback)
    const getValidNextStatuses = (currentStatus: string) => {
        const statusFlow: { [key: string]: string[] } = {
            'Pending': ['Pending', 'Processing', 'Cancelled'],
            'Processing': ['Processing', 'Shipped', 'Cancelled'],
            'Shipped': ['Shipped', 'OutForDelivery'],
            'OutForDelivery': ['OutForDelivery', 'Delivered'],
            'Delivered': ['Delivered'], // Cannot change once delivered
            'Cancelled': ['Cancelled'] // Cannot change once cancelled
        };
        return statusFlow[currentStatus] || ['Pending', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'];
    };

    // Save Financials Handler
    const handleSaveFinancials = async () => {
        if (!order || !user) return;
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${order._id}/financials`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    orderItems: order.orderItems, // Sends updated prices inside items
                    shippingPrice: order.shippingPrice
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setOrder(updated);
                setIsEditingFinancials(false);
                alert('Order updated and totals recalculated.');
            } else {
                alert('Failed to update order financials.');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating financials.');
        }
    };
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        // @ts-ignore
        content: () => componentRef.current,
        documentTitle: `Invoice_${id}`,
    });

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                const data = await res.json();
                setOrder(data);
                setInvoiceForm({
                    invoiceNumber: data.invoiceNumber || '',
                    manualInvoiceUrl: data.manualInvoiceUrl || ''
                });
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

    const handleUpdateInvoice = async () => {
        if (user?.role !== 'admin') return;
        setAdminLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${order._id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    status: order.status, // Keep existing status
                    invoiceNumber: invoiceForm.invoiceNumber,
                    manualInvoiceUrl: invoiceForm.manualInvoiceUrl
                })
            });
            if (res.ok) {
                const updatedOrder = await res.json();
                setOrder(updatedOrder);
                alert('Invoice details updated successfully');
            } else {
                alert('Failed to update invoice details');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating invoice details');
        } finally {
            setAdminLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 no-print gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary mb-2">Order <span className="text-gold">#{order._id.substring(0, 8)}</span></h1>
                    <p className="text-secondary text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="bg-gold text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors shadow-lg shadow-gold/20"
                    >
                        <Printer size={18} /> Download Invoice
                    </button>
                    {user?.role !== 'admin' && (
                        <Link to="/products" className="text-secondary hover:text-gold transition-colors flex items-center text-sm font-bold uppercase tracking-widest border border-white/10 px-6 py-3 rounded-lg hover:border-gold">
                            Continue Shopping
                        </Link>
                    )}
                </div>
            </div>



            {/* Order Actions & Status */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 no-print">
                <div className="flex-1">
                    {order.refundStatus && order.refundStatus !== 'None' && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        <span className="font-bold">Refund Status:</span> {order.refundStatus}
                                        {order.refundAmount && ` (Amount: ₹${order.refundAmount})`}
                                    </p>
                                    {order.refundStatus === 'Processed' && (
                                        <p className="text-xs text-blue-600 mt-1">Refund processed on {order.refundDate ? new Date(order.refundDate).toLocaleDateString() : 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    {/* Conditionally Render Cancel Button */}
                    {!['Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'].includes(order.status) && (
                        <button
                            onClick={async () => {
                                if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
                                    try {
                                        const res = await fetch(`http://localhost:5000/api/orders/${order._id}/cancel`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${user?.token}`
                                            },
                                            body: JSON.stringify({ reason: 'User requested cancellation via dashboard' })
                                        });
                                        if (res.ok) {
                                            const updated = await res.json();
                                            setOrder(updated);
                                            alert('Order cancelled successfully.');
                                        } else {
                                            const err = await res.json();
                                            alert(err.message || 'Failed to cancel order');
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        alert('Error cancelling order');
                                    }
                                }
                            }}
                            className="bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-lg font-bold hover:bg-red-100 transition-colors uppercase tracking-widest text-xs"
                        >
                            Cancel Order
                        </button>
                    )}
                </div>
            </div>

            {/* ADMIN-ONLY SECTIONS */}
            {user?.role === 'admin' && (
                <>
                    {/* Payment & Transaction Details */}
                    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 p-6 rounded-xl mb-6 no-print shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-serif font-bold text-green-400 flex items-center gap-2">
                                💳 Payment & Transaction Details
                            </h2>
                            {order.paymentMethod === 'BankTransfer' && (
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(`http://localhost:5000/api/orders/${order._id}/payment`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    Authorization: `Bearer ${user?.token}`
                                                },
                                                body: JSON.stringify({ isPaid: !order.isPaid })
                                            });
                                            if (res.ok) {
                                                const updated = await res.json();
                                                setOrder(updated);
                                                alert(`Payment marked as ${!order.isPaid ? 'VERIFIED' : 'UNVERIFIED'}`);
                                            }
                                        } catch (error) {
                                            console.error(error);
                                            alert('Error updating payment status');
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${order.isPaid
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                                        : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                                        }`}
                                >
                                    {order.isPaid ? '✗ Mark as Unpaid' : '✓ Verify & Mark Paid'}
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Payment Method</p>
                                <p className="text-white font-bold text-lg">{order.paymentMethod || 'N/A'}</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Payment Status</p>
                                <p className={`font-bold text-lg ${order.isPaid ? 'text-green-400' : 'text-red-400'}`}>
                                    {order.isPaid ? '✓ PAID' : '✗ UNPAID'}
                                </p>
                                {order.paidAt && <p className="text-xs text-gray-500 mt-1">{new Date(order.paidAt).toLocaleString()}</p>}
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Transaction ID / UTR</p>
                                {order.paymentMethod === 'BankTransfer' ? (
                                    <>
                                        <p className="text-white font-mono text-lg font-bold break-all">
                                            {order.paymentResult?.id || 'No UTR Provided'}
                                        </p>
                                        {order.paymentResult?.status && (
                                            <p className="text-xs text-gold mt-1">Status: {order.paymentResult.status}</p>
                                        )}
                                        {order.paymentResult?.update_time && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Submitted: {new Date(order.paymentResult.update_time).toLocaleString()}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-sm italic">Online Payment - No UTR Required</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/30 p-6 rounded-xl mb-6 no-print shadow-lg">
                        <h2 className="text-xl font-serif font-bold mb-4 text-blue-400 flex items-center gap-2">
                            👤 Customer Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Customer Name</p>
                                <p className="text-white font-bold text-lg">{order.user?.name || 'N/A'}</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Email Address</p>
                                <p className="text-white font-mono text-sm">{order.user?.email || 'N/A'}</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Phone Number</p>
                                <p className="text-white font-mono text-sm">{order.shippingAddress?.phone || order.user?.phone || 'N/A'}</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Customer ID</p>
                                <p className="text-white font-mono text-xs">{order.user?._id || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-6 rounded-xl mb-6 no-print shadow-lg">
                        <h2 className="text-xl font-serif font-bold mb-4 text-purple-400 flex items-center gap-2">
                            🚚 Delivery Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Delivery Method</p>
                                <p className="text-white font-bold text-lg">{order.deliveryMethod || 'Courier'}</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Delivery Status</p>
                                <p className={`font-bold text-lg ${order.isDelivered ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {order.isDelivered ? '✓ DELIVERED' : '⏳ IN TRANSIT'}
                                </p>
                                {order.deliveredAt && <p className="text-xs text-gray-500 mt-1">{new Date(order.deliveredAt).toLocaleString()}</p>}
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10 col-span-1 md:col-span-2">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Shipping Address</p>
                                <p className="text-white text-sm leading-relaxed">
                                    {order.shippingAddress?.address}<br />
                                    {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                                    {order.shippingAddress?.country}
                                </p>
                            </div>
                            {(order.trackingNumber || order.courierName) && (
                                <div className="bg-black/30 p-4 rounded-lg border border-white/10 col-span-1 md:col-span-2">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Track Your Shipment</p>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        {order.courierName && (
                                            <span className="text-white font-bold text-lg">{order.courierName}</span>
                                        )}
                                        {order.trackingNumber && (
                                            <>
                                                <span className="text-gray-400">•</span>
                                                <a
                                                    href={getTrackingUrl(order.courierName || '', order.trackingNumber)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gold font-mono text-lg font-bold hover:text-yellow-400 transition-colors underline decoration-gold/50 hover:decoration-gold"
                                                >
                                                    {order.trackingNumber}
                                                </a>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Click tracking number to open courier website</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Status Management */}
                    <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 p-6 rounded-xl mb-6 no-print shadow-lg">
                        <h2 className="text-xl font-serif font-bold mb-4 text-orange-400 flex items-center gap-2">
                            📦 Order Status Management
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Update Order Status</label>
                                <select
                                    value={order.status}
                                    onChange={async (e) => {
                                        const newStatus = e.target.value;
                                        if (newStatus === order.status) return; // No change

                                        if (window.confirm(`Update order status to "${newStatus}"?`)) {
                                            try {
                                                const res = await fetch(`http://localhost:5000/api/orders/${order._id}/status`, {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        Authorization: `Bearer ${user?.token}`
                                                    },
                                                    body: JSON.stringify({ status: newStatus })
                                                });
                                                if (res.ok) {
                                                    const updated = await res.json();
                                                    setOrder(updated);
                                                    alert(`Order status updated to ${newStatus}`);
                                                }
                                            } catch (error) {
                                                console.error(error);
                                                alert('Error updating status');
                                            }
                                        }
                                    }}
                                    className="w-full bg-black/50 border border-orange-500/50 text-white p-3 rounded-lg focus:border-gold outline-none cursor-pointer font-bold"
                                >
                                    {getValidNextStatuses(order.status).map(status => (
                                        <option key={status} value={status}>
                                            {status === 'OutForDelivery' ? 'Out for Delivery' : status}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    Current: <span className="text-orange-400 font-bold">{order.status}</span>
                                    {['Delivered', 'Cancelled'].includes(order.status) && (
                                        <span className="text-red-400 ml-2">• Status cannot be changed</span>
                                    )}
                                </p>
                            </div>

                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Courier Details</label>
                                <select
                                    value={courierName}
                                    onChange={(e) => setCourierName(e.target.value)}
                                    className="w-full bg-black/50 border border-orange-500/50 text-white p-3 rounded-lg focus:border-gold outline-none text-sm mb-3"
                                >
                                    <option value="Blue Dart">Blue Dart</option>
                                    <option value="DTDC">DTDC</option>
                                    <option value="Delhivery">Delhivery</option>
                                    <option value="FedEx">FedEx</option>
                                    <option value="DHL">DHL</option>
                                    <option value="India Post">India Post</option>
                                    <option value="Ecom Express">Ecom Express</option>
                                    <option value="Xpressbees">Xpressbees</option>
                                </select>

                                <input
                                    type="text"
                                    value={trackingInfo}
                                    onChange={(e) => setTrackingInfo(e.target.value)}
                                    placeholder="Enter tracking/AWB number"
                                    className="w-full bg-black/50 border border-orange-500/50 text-white p-3 rounded-lg focus:border-gold outline-none text-sm mb-3"
                                />

                                <button
                                    onClick={async () => {
                                        if (!trackingInfo.trim()) {
                                            alert('Please enter tracking number');
                                            return;
                                        }
                                        try {
                                            const res = await fetch(`http://localhost:5000/api/orders/${order._id}/status`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    Authorization: `Bearer ${user?.token}`
                                                },
                                                body: JSON.stringify({
                                                    status: order.status,
                                                    trackingInfo: trackingInfo,
                                                    courierName: courierName
                                                })
                                            });
                                            if (res.ok) {
                                                const updated = await res.json();
                                                setOrder(updated);
                                                alert('Tracking details added successfully');
                                                setTrackingInfo('');
                                            }
                                        } catch (error) {
                                            console.error(error);
                                            alert('Error adding tracking info');
                                        }
                                    }}
                                    disabled={!trackingInfo.trim()}
                                    className="w-full bg-orange-500/20 text-orange-400 border border-orange-500/50 px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Tracking Details
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Management */}
                    <div className="bg-card border border-gold/30 p-6 rounded-xl mb-8 no-print shadow-lg shadow-gold/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <FileText size={100} />
                        </div>
                        <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2 text-primary">
                            <FileText className="text-gold" /> Invoice Management
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-2">Custom Invoice Number (Bill No)</label>
                                <input
                                    type="text"
                                    value={invoiceForm.invoiceNumber}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                                    placeholder="e.g. INV-2024-001"
                                    className="w-full px-4 py-3 bg-secondary/10 border border-theme rounded-lg text-primary focus:border-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-2">Manual Invoice URL (Optional)</label>
                                <input
                                    type="text"
                                    value={invoiceForm.manualInvoiceUrl}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, manualInvoiceUrl: e.target.value })}
                                    placeholder="http://..."
                                    className="w-full px-4 py-3 bg-secondary/10 border border-theme rounded-lg text-primary focus:border-gold focus:outline-none"
                                />
                                <p className="text-[10px] text-secondary mt-1">Provide a direct link to a hosted PDF if bypassing auto-generation.</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleUpdateInvoice}
                                disabled={adminLoading}
                                className="bg-primary border border-gold text-gold hover:bg-gold hover:text-black px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                            >
                                <Save size={18} /> {adminLoading ? 'Saving...' : 'Save Invoice Details'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Tracking Timeline (Screen Only) */}
            <div className="bg-card backdrop-blur-md p-8 rounded-xl border border-white/10 mb-8 no-print shadow-xl">
                <h2 className="text-xl font-serif font-bold mb-8 flex items-center gap-3 text-primary">
                    <div className="p-2 bg-gold/10 rounded-full text-gold">
                        <Truck size={20} />
                    </div>
                    Tracking Status
                </h2>
                <div className="relative flex justify-between items-center w-full max-w-4xl mx-auto mb-12">
                    {/* Progress Bar background */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -z-0 rounded-full"></div>
                    {/* Active Progress Bar */}
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-gold -z-0 transition-all duration-1000 rounded-full"
                        style={{ width: `${(currentStep - 1) * 25}%` }}
                    ></div>

                    {['Ordered', 'Processing', 'Shipped', 'Out', 'Delivered'].map((step, index) => {
                        const active = index + 1 <= currentStep;
                        return (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-3 bg-red min-w-[80px]">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 bg-card ${active ? 'border-gold text-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-gray-700 text-gray-700'}`}>
                                    {active ? <CheckCircle size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-gray-700"></div>}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${active ? 'text-gold' : 'text-gray-600'}`}>{step}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Tracking History Log */}
                <div className="mt-8 bg-black/20 p-6 rounded-lg border border-white/5">
                    <h3 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">Activity Log</h3>
                    <div className="space-y-6">
                        {order.trackingHistory && order.trackingHistory.length > 0 ? (
                            order.trackingHistory.map((history: any, idx: number) => (
                                <div key={idx} className="flex gap-4 items-start relative pl-4 border-l border-white/10">
                                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gold"></div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-200">{history.status}</p>
                                        <p className="text-xs text-gray-400 mt-1">{history.description}</p>
                                        <p className="text-[10px] text-gray-600 mt-1 font-mono uppercase">{new Date(history.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">No updates available yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* INVOICE SECTION (Printable) */}
            {/* On screen: Card style. On print: Clean white style. */}
            <div ref={componentRef} className="bg-white text-black p-10 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full max-w-4xl mx-auto">
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-serif font-bold mb-2 tracking-tight">INVOICE</h1>
                        <p className="text-sm text-gray-500 font-mono">#{order.invoiceNumber || order._id.substring(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500 mt-1">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold font-serif text-gold">{COMPANY_DETAILS.name}</h2>
                        <div className="text-xs text-gray-600 mt-2 leading-relaxed">
                            {COMPANY_DETAILS.address.map((line, idx) => (
                                <p key={idx}>{line}</p>
                            ))}
                            <p className="mt-2 font-bold text-black">GSTIN: {COMPANY_DETAILS.gstin}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-10">
                    <div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Bill To</h3>
                        <p className="font-bold text-lg">{order.user?.name}</p>
                        <div className="text-sm text-gray-600 mt-1">
                            <p>{order.billingAddress?.address}</p>
                            <p>{order.billingAddress?.city}, {order.billingAddress?.postalCode}</p>
                            <p>{order.billingAddress?.country}</p>
                            <p className="mt-2">Phone: {order.shippingAddress?.phone}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Ship To</h3>
                        <div className="text-sm text-gray-600">
                            <p className="font-bold text-black text-lg">{order.shippingAddress?.address}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                            <p>{order.shippingAddress?.country}</p>
                        </div>
                    </div>
                </div>

                {/* Admin Financial Editing */}
                {user?.role === 'admin' && (
                    <div className="flex justify-end mb-4 no-print">
                        {!adminLoading && (
                            <button
                                onClick={() => setIsEditingFinancials(!isEditingFinancials)}
                                className="text-gold text-sm font-bold uppercase tracking-wider hover:underline"
                            >
                                {isEditingFinancials ? 'Cancel Editing' : 'Edit Prices & Shipping'}
                            </button>
                        )}
                    </div>
                )}

                <table className="w-full mb-8">
                    <thead className="bg-gray-50 border-y border-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item Details</th>
                            <th className="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                            <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Rate</th>
                            <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order.orderItems.map((item: any, idx: number) => (
                            <tr key={idx}>
                                <td className="py-4 px-4">
                                    <p className="font-bold text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.materialType}</p>
                                    {(item.customization || (item.relatedSampleId && item.type === 'regular')) && (
                                        <div className="mt-1 text-[10px] text-gray-400 bg-gray-50 p-1 rounded inline-block">
                                            {item.customization && <p>Note: {item.customization}</p>}
                                            {item.relatedSampleId && <p>Sample Ref: {item.relatedSampleId.substring(0, 8)}</p>}
                                        </div>
                                    )}
                                </td>
                                <td className="py-4 px-4 text-center text-xs font-medium uppercase text-gray-500">{item.type}</td>
                                <td className="py-4 px-4 text-right text-sm font-mono">{item.quantity}</td>
                                <td className="py-4 px-4 text-right text-sm font-mono text-gray-600">
                                    {isEditingFinancials ? (
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => {
                                                const newPrice = Number(e.target.value);
                                                const newItems = [...order.orderItems];
                                                newItems[idx].price = newPrice;
                                                setOrder({ ...order, orderItems: newItems });
                                            }}
                                            className="w-24 text-right border border-gold px-2 py-1 rounded"
                                        />
                                    ) : (
                                        `₹${item.price.toFixed(2)}`
                                    )}
                                </td>
                                <td className="py-4 px-4 text-right text-sm font-bold font-mono">₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end mb-12">
                    <div className="w-80 bg-gray-50 p-6 rounded-lg relative">
                        {isEditingFinancials && (
                            <button
                                onClick={handleSaveFinancials}
                                className="absolute -top-12 right-0 bg-gold text-black px-4 py-2 text-xs font-bold uppercase tracking-wider rounded shadow-lg hover:bg-yellow-500"
                            >
                                Recalculate & Save
                            </button>
                        )}

                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            {/* Dynamically calculated for view if editing, but server does real math on save. Visual approximation here. */}
                            <span className="font-mono">₹{order.orderItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <span className="text-gray-600">Shipping</span>
                            {isEditingFinancials ? (
                                <input
                                    type="number"
                                    value={order.shippingPrice}
                                    onChange={(e) => setOrder({ ...order, shippingPrice: Number(e.target.value) })}
                                    className="w-20 text-right border border-gold px-1 py-0.5 rounded text-xs"
                                />
                            ) : (
                                <span className="font-mono">₹{order.shippingPrice}</span>
                            )}
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <span className="text-gray-600">Tax (18% GST)</span>
                            <span className="font-mono">
                                {/* Visual Estimate */}
                                ₹{(order.orderItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) * 0.18).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200">
                            <span>Total Amount</span>
                            <span className="font-mono text-gold">
                                {/* Visual Estimate */}
                                ₹{(
                                    order.orderItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) * 1.18 +
                                    (Number(order.shippingPrice) || 0)
                                ).toFixed(2)}
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 text-right mt-2 uppercase tracking-wide">Inclusive of all taxes</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col items-center text-center">
                    <h4 className="font-serif font-bold text-lg mb-2 text-gold">Thank you for choosing Zain Fabrics</h4>
                    <p className="text-xs text-gray-500 max-w-sm">
                        This is a computer generated invoice and does not require a physical signature.
                        For support, verify details at support@zain-fabrics.com
                    </p>
                </div>
            </div>
        </div >
    );
};

export default OrderDetailsPage;
