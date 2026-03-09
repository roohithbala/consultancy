import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import type { RootState } from '../store';

// Modular Components
import OrderHeader from '../components/OrderDetails/OrderHeader';
import OrderActionButtons from '../components/OrderDetails/OrderActionButtons';
import AdminPaymentCard from '../components/OrderDetails/AdminPaymentCard';
import AdminCustomerCard from '../components/OrderDetails/AdminCustomerCard';
import AdminDeliveryCard from '../components/OrderDetails/AdminDeliveryCard';
import AdminStatusManager from '../components/OrderDetails/AdminStatusManager';
import AdminInvoiceForm from '../components/OrderDetails/AdminInvoiceForm';
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
    const [adminLoading, setAdminLoading] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({ invoiceNumber: '', manualInvoiceUrl: '' });
    const contentRef = useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                const data = await res.json();
                setOrder(data);
                setInvoiceForm({ invoiceNumber: data.invoiceNumber || '', manualInvoiceUrl: data.manualInvoiceUrl || '' });
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

    const handleUpdateInvoice = async () => {
        if (user?.role !== 'admin') return;
        setAdminLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${order._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
                body: JSON.stringify({ invoiceNumber: invoiceForm.invoiceNumber, manualInvoiceUrl: invoiceForm.manualInvoiceUrl })
            });
            if (res.ok) setOrder(await res.json());
        } catch (e) { console.error(e); } finally { setAdminLoading(false); }
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!order) return <div className="p-20 text-center">Order not found</div>;

    return (
        <div className="container mx-auto px-4 py-12">
            <OrderHeader orderId={order._id} createdAt={order.createdAt} onPrint={() => reactToPrintFn()} isAdmin={user?.role === 'admin'} />
            <OrderActionButtons status={order.status} orderId={order._id} token={user?.token || ''} onStatusUpdate={setOrder} refundStatus={order.refundStatus} refundAmount={order.refundAmount} />
            
            {user?.role === 'admin' && (
                <>
                    <AdminPaymentCard order={order} token={user.token} onUpdate={setOrder} />
                    <AdminCustomerCard order={order} />
                    <AdminDeliveryCard order={order} getTrackingUrl={(c, t) => `https://google.com/search?q=${c}+${t}`} />
                    <AdminStatusManager order={order} token={user.token} onUpdate={setOrder} getValidNextStatuses={(s) => [s, 'Processing', 'Shipped', 'Delivered', 'Cancelled']} />
                    <AdminInvoiceForm token={user.token} onUpdate={setOrder} invoiceForm={invoiceForm} setInvoiceForm={setInvoiceForm} adminLoading={adminLoading} handleUpdateInvoice={handleUpdateInvoice} />
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
