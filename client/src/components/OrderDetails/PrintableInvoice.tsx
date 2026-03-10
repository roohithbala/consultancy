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
            <div ref={ref} className="bg-white text-black p-16 print:p-0 max-w-5xl mx-auto font-sans">
                {/* Header */}
                <div className="flex justify-between border-b-2 border-gray-100 pb-12 mb-12">
                    <div>
                        <h1 className="text-5xl font-serif font-bold mb-4 tracking-tight">INVOICE</h1>
                        <p className="text-sm text-gray-400 font-mono mb-1">NO: {order.invoiceNumber || order._id.substring(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500 font-medium">DATE: {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold font-serif text-black">{COMPANY_DETAILS.name}</h2>
                        <div className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                            {COMPANY_DETAILS.address.map((l, i) => <p key={i}>{l}</p>)}
                            <p className="font-bold text-black mt-2 text-xs uppercase tracking-wider">GSTIN: {COMPANY_DETAILS.gstin}</p>
                        </div>
                    </div>
                </div>

                {/* Billing/Shipping */}
                <div className="grid grid-cols-2 gap-16 mb-16 text-sm">
                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-4">Bill To</h3>
                        <p className="font-bold text-base mb-1">{order.user?.name}</p>
                        <p className="text-gray-600 leading-relaxed">{order.billingAddress?.address}</p>
                        <p className="text-gray-600 mb-2">{order.billingAddress?.city}, {order.billingAddress?.postalCode}</p>
                        <p className="text-gray-500 text-xs mt-2 font-mono">TEL: {order.shippingAddress?.phone}</p>
                    </div>
                    <div className="p-6">
                        <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-4">Ship To</h3>
                        <p className="text-gray-600 leading-relaxed">{order.shippingAddress?.address}</p>
                        <p className="text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                        <p className="text-gray-600">{order.shippingAddress?.country}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-12 text-xs border-collapse">
                    <thead className="bg-gray-100 border-y border-gray-200">
                        <tr>
                            <th className="py-4 px-6 text-left font-bold uppercase tracking-wider text-gray-600">Item Description</th>
                            <th className="py-4 px-6 text-right font-bold uppercase tracking-wider text-gray-600">Qty</th>
                            <th className="py-4 px-6 text-right font-bold uppercase tracking-wider text-gray-600">Price</th>
                            <th className="py-4 px-6 text-right font-bold uppercase tracking-wider text-gray-600">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order.orderItems.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                <td className="py-6 px-6">
                                    <p className="font-bold text-sm text-black mb-1">{item.name}</p>
                                    <p className="text-gray-500 text-[11px]">{item.materialType} {item.color && <span className="text-gray-300 mx-2">|</span>} {item.color && `Color: ${item.color}`}</p>
                                    {item.customization && (
                                        <div className="mt-2 p-2 bg-yellow-50/50 border-l-2 border-yellow-200 text-[10px] text-gray-500 italic">
                                            "Note: {item.customization}"
                                        </div>
                                    )}
                                </td>
                                <td className="py-6 px-6 text-right font-mono text-gray-600">{item.quantity}</td>
                                <td className="py-6 px-6 text-right font-mono text-gray-600">₹{item.price.toFixed(2)}</td>
                                <td className="py-6 px-6 text-right font-bold font-mono text-black text-sm">₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer Totals */}
                <div className="flex justify-between items-start gap-12">
                    <div className="flex-1 text-gray-400 text-[10px] uppercase tracking-widest leading-relaxed pt-4">
                        <p className="mb-2 font-bold text-gray-600">Terms & Conditions</p>
                        <p>1. Please quote invoice number for any queries.</p>
                        <p>2. Goods once sold will not be taken back.</p>
                        <p>3. Subject to jurisdiction of local courts.</p>
                    </div>
                    <div className="w-80 bg-gray-50 dark:bg-black p-8 rounded-2xl shadow-2xl space-y-4 border border-gray-200 dark:border-white/10">
                        <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs"><span>Subtotal</span><span className="font-mono text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs"><span>Shipping Fee</span><span className="font-mono text-gray-900 dark:text-white">₹{order.shippingPrice}</span></div>
                        <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs pb-4 border-b border-gray-200 dark:border-white/10"><span>GST (18%)</span><span className="font-mono text-gray-900 dark:text-white">₹{gst.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-xl pt-2">
                            <span className="text-gray-900 dark:text-brand font-serif italic">Grand Total</span>
                            <span className="font-mono text-gray-900 dark:text-white">₹{order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Brand Message */}
                <div className="mt-24 text-center border-t border-gray-100 pt-12">
                    <p className="text-xs text-gray-400 uppercase tracking-[0.4em] mb-4">Thank you for choosing Material Excellence</p>
                    <h3 className="text-lg font-serif italic text-gold">{COMPANY_DETAILS.name}</h3>
                </div>
            </div>
        );
    }
);

PrintableInvoice.displayName = 'PrintableInvoice';
export default PrintableInvoice;
