import { FileText, Save } from 'lucide-react';

interface AdminInvoiceFormProps {
    token: string;
    onUpdate: (updatedOrder: any) => void;
    invoiceForm: { invoiceNumber: string };
    setInvoiceForm: (f: any) => void;
    adminLoading: boolean;
    handleUpdateInvoice: () => void;
}

const AdminInvoiceForm = ({ invoiceForm, setInvoiceForm, adminLoading, handleUpdateInvoice }: AdminInvoiceFormProps) => {
    return (
        <div className="bg-gray-50 dark:bg-card border border-gray-200 dark:border-brand/30 p-6 rounded-xl mb-8 no-print shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><FileText size={100} /></div>
            <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <FileText className="text-brand" /> Invoice Management
            </h2>
            <div className="grid grid-cols-1 gap-6">
                <Input label="Invoice Number" value={invoiceForm.invoiceNumber} onChange={(v: string) => setInvoiceForm({ ...invoiceForm, invoiceNumber: v })} placeholder="Enter invoice number..." />
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={handleUpdateInvoice} disabled={adminLoading} className="bg-brand text-white dark:text-black px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-95">
                    <Save size={18} /> {adminLoading ? 'Saving...' : 'Save Invoice'}
                </button>
            </div>
        </div>
    );
};

const Input = ({ label, value, onChange, placeholder }: any) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-2">{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 bg-white dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-brand outline-none shadow-sm" />
    </div>
);

export default AdminInvoiceForm;
