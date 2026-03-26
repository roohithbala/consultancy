import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import { LifeBuoy } from 'lucide-react';
import type { RootState } from '../store';
import { API } from '../config/api';

// Modular Components
import OrderHeader from '../components/OrderDetails/OrderHeader';
import OrderActionButtons from '../components/OrderDetails/OrderActionButtons';
import AdminPaymentCard from '../components/OrderDetails/AdminPaymentCard';
import AdminCustomerCard from '../components/OrderDetails/AdminCustomerCard';
import AdminDeliveryCard from '../components/OrderDetails/AdminDeliveryCard';
import AdminStatusManager from '../components/OrderDetails/AdminStatusManager';
import OrderItemsList from '../components/OrderDetails/OrderItemsList';
import TrackingTimeline from '../components/OrderDetails/TrackingTimeline';
import ActivityLog from '../components/OrderDetails/ActivityLog';
import PrintableInvoice from '../components/OrderDetails/PrintableInvoice';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const showInvoice = searchParams.get('showInvoice') === 'true';
    const { user } = useSelector((state: RootState) => state.auth);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`${API}/orders/${id}`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                const data = await res.json();
                setOrder(data);
                setLoading(false);
            } catch (error) { console.error(error); setLoading(false); }
        };
        fetchOrder();
    }, [id, user]);

    // Auto-print if showInvoice is true
    useEffect(() => {
        if (!loading && order && showInvoice) {
            // Small delay to ensure PrintableInvoice is rendered
            const timer = setTimeout(() => {
                reactToPrintFn();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loading, order, showInvoice, reactToPrintFn]);

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!order) return <div className="p-20 text-center">Order not found</div>;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    <OrderHeader orderId={order._id} createdAt={order.createdAt} onPrint={() => reactToPrintFn()} isAdmin={user?.role === 'admin'} />
                </div>
                <Link
                    to={`/support?orderId=${order._id}`}
                    className="ml-4 flex items-center gap-2 bg-brand/10 border border-brand/30 text-brand hover:bg-brand hover:text-black transition-colors px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest mt-2"
                >
                    <LifeBuoy size={18} /> Raise Ticket
                </Link>
            </div>
            
            <OrderActionButtons status={order.status} orderId={order._id} token={user?.token || ''} onStatusUpdate={setOrder} refundStatus={order.refundStatus} refundAmount={order.refundAmount} isAdmin={user?.role === 'admin'} />
            
            {user?.role === 'admin' && (
                <>
                    <AdminPaymentCard order={order} token={user.token} onUpdate={setOrder} />
                    <AdminCustomerCard order={order} />
                    <AdminDeliveryCard order={order} getTrackingUrl={(c, t) => `https://google.com/search?q=${c}+${t}`} />
                    <AdminStatusManager 
                        order={order} 
                        token={user.token} 
                        onUpdate={setOrder} 
                        getValidNextStatuses={(s) => {
                            const flow = ['Ordered', 'Processing', 'Shipped', 'Out', 'Delivered'];
                            // Normalize 'Pending' for logic (Legacy support)
                            const effectiveStatus = (s === 'Pending') ? 'Ordered' : s;
                            const idx = flow.indexOf(effectiveStatus);
                            if (idx === -1) return [s]; 
                            const next = flow[idx + 1];
                            return next ? [s, next] : [s];
                        }} 
                    />
                </>
            )}

            <OrderItemsList orderItems={order.orderItems} />
            <TrackingTimeline currentStatus={order.status} />
            <ActivityLog trackingHistory={order.trackingHistory} />
            
            <div className="hidden"><PrintableInvoice ref={contentRef} order={order} /></div>
        </div>
    );
};

export default OrderDetailsPage;
