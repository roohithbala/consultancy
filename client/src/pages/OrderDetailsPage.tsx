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
        if (!(user as any)?.isAdmin) return;
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
                    <Link to="/products" className="text-secondary hover:text-gold transition-colors flex items-center text-sm font-bold uppercase tracking-widest border border-white/10 px-6 py-3 rounded-lg hover:border-gold">
                        Continue Shopping
                    </Link>
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

            {/* Admin Controls */}
            {
                (user as any)?.isAdmin && (
                    <div className="bg-card border border-gold/30 p-6 rounded-xl mb-8 no-print shadow-lg shadow-gold/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <FileText size={100} />
                        </div>
                        <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2 text-primary">
                            <FileText className="text-gold" /> Admin Invoice Management
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
                )
            }

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
                                <td className="py-4 px-4 text-right text-sm font-mono text-gray-600">₹{item.price.toFixed(2)}</td>
                                <td className="py-4 px-4 text-right text-sm font-bold font-mono">₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end mb-12">
                    <div className="w-72 bg-gray-50 p-6 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-mono">₹{order.itemsPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <span className="text-gray-600">Tax (18% GST)</span>
                            <span className="font-mono">₹{order.taxPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200">
                            <span>Total Amount</span>
                            <span className="font-mono text-gold">₹{order.totalPrice.toFixed(2)}</span>
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
