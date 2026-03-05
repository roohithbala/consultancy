import { forwardRef } from 'react';
import { COMPANY_DETAILS } from '../../config/companyDetails';

interface PrintableInvoiceProps {
    order: any;
}

const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
    ({ order }, ref) => {
        const subtotal = order.orderItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        const gst = subtotal * 0.18;

        return (
            <div ref={ref} className="bg-white text-black p-10 print:p-0 max-w-4xl mx-auto font-sans">
                {/* Header */}
                <div className="flex justify-between border-b border-gray-200 pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-serif font-bold mb-2">INVOICE</h1>
                        <p className="text-sm text-gray-500 font-mono">#{order.invoiceNumber || order._id.substring(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold font-serif text-gold">{COMPANY_DETAILS.name}</h2>
                        <div className="text-[10px] text-gray-600 mt-1">
                            {COMPANY_DETAILS.address.map((l, i) => <p key={i}>{l}</p>)}
                            <p className="font-bold text-black mt-1">GSTIN: {COMPANY_DETAILS.gstin}</p>
                        </div>
                    </div>
                </div>

                {/* Billing/Shipping */}
                <div className="grid grid-cols-2 gap-12 mb-10 text-sm">
                    <div>
                        <h3 className="text-gray-400 font-bold uppercase text-[10px] mb-2">Bill To</h3>
                        <p className="font-bold">{order.user?.name}</p>
                        <p>{order.billingAddress?.address}, {order.billingAddress?.city}</p>
                        <p>Phone: {order.shippingAddress?.phone}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-gray-400 font-bold uppercase text-[10px] mb-2">Ship To</h3>
                        <p>{order.shippingAddress?.address}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8 text-xs">
                    <thead className="bg-gray-50 border-y border-gray-200">
                        <tr>
                            <th className="py-2 px-4 text-left">Item Details</th>
                            <th className="py-2 px-4 text-right">Qty</th>
                            <th className="py-2 px-4 text-right">Rate</th>
                            <th className="py-2 px-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order.orderItems.map((item: any, idx: number) => (
                            <tr key={idx}>
                                <td className="py-3 px-4">
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-gray-500">{item.materialType} {item.color && `(${item.color})`}</p>
                                    {item.customization && <p className="text-[10px] text-gray-400 italic">"Note: {item.customization}"</p>}
                                </td>
                                <td className="py-3 px-4 text-right font-mono">{item.quantity}</td>
                                <td className="py-3 px-4 text-right font-mono">₹{item.price.toFixed(2)}</td>
                                <td className="py-3 px-4 text-right font-bold font-mono">₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer Totals */}
                <div className="flex justify-end">
                    <div className="w-64 bg-gray-50 p-4 rounded text-sm space-y-2">
                        <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">₹{subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span className="font-mono">₹{order.shippingPrice}</span></div>
                        <div className="flex justify-between"><span>GST (18%)</span><span className="font-mono">₹{gst.toFixed(2)}</span></div>
                        <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-lg"><span>Total</span><span className="font-mono">₹{order.totalPrice.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
        );
    }
);

PrintableInvoice.displayName = 'PrintableInvoice';
export default PrintableInvoice;
