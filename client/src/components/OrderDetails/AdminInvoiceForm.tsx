import { FileText, Save } from 'lucide-react';

interface AdminInvoiceFormProps {
    token: string;
    onUpdate: (updatedOrder: any) => void;
    invoiceForm: { invoiceNumber: string; manualInvoiceUrl: string };
    setInvoiceForm: (f: any) => void;
    adminLoading: boolean;
    handleUpdateInvoice: () => void;
}

const AdminInvoiceForm = ({ invoiceForm, setInvoiceForm, adminLoading, handleUpdateInvoice }: AdminInvoiceFormProps) => {
    return (
        <div className="bg-card border border-gold/30 p-6 rounded-xl mb-8 no-print shadow-lg shadow-gold/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><FileText size={100} /></div>
            <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2 text-primary">
                <FileText className="text-gold" /> Invoice Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Invoice Number" value={invoiceForm.invoiceNumber} onChange={(v: string) => setInvoiceForm({ ...invoiceForm, invoiceNumber: v })} />
                <Input label="Manual URL" value={invoiceForm.manualInvoiceUrl} onChange={(v: string) => setInvoiceForm({ ...invoiceForm, manualInvoiceUrl: v })} placeholder="http://..." />
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={handleUpdateInvoice} disabled={adminLoading} className="bg-primary border border-gold text-gold hover:bg-gold hover:text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Save size={18} /> {adminLoading ? 'Saving...' : 'Save Invoice'}
                </button>
            </div>
        </div>
    );
};

const Input = ({ label, value, onChange, placeholder }: any) => (
    <div>
        <label className="block text-sm font-bold text-secondary mb-2">{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 bg-secondary/10 border border-theme rounded-lg text-primary focus:border-gold outline-none" />
    </div>
);

export default AdminInvoiceForm;
