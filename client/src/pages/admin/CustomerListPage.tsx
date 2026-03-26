import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, Mail, User, Clock, CheckCircle } from 'lucide-react';
import type { RootState } from '../../store';
import { API } from '../../config/api';

const CustomerListPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailData, setEmailData] = useState({ subject: '', message: '' });
    const [sending, setSending] = useState(false);

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${API}/users`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            const data = await res.json();
            setCustomers(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;
        setSending(true);
        try {
            const res = await fetch(`${API}/users/${selectedCustomer._id}/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify(emailData)
            });
            if (res.ok) {
                alert('Email sent successfully');
                setShowEmailModal(false);
                setEmailData({ subject: '', message: '' });
            } else {
                alert('Failed to send email');
            }
        } catch (error) {
            console.error(error);
            alert('Error sending email');
        } finally {
            setSending(false);
        }
    };

    const sendGreeting = (customer: any) => {
        setSelectedCustomer(customer);
        setEmailData({
            subject: 'Welcome to Zain Fabrics - Premium Textile Partners',
            message: `Dear ${customer.name},\n\nWelcome to Zain Fabrics! We are delighted to have you as part of our premium textile network. Explore our latest collections and let us know if you have any specific requirements.\n\nBest Regards,\nZain Fabrics Team`
        });
        setShowEmailModal(true);
    };

    const sendReminder = (customer: any) => {
        setSelectedCustomer(customer);
        setEmailData({
            subject: 'Checking In - Your Interest in Zain Fabrics',
            message: `Dear ${customer.name},\n\nWe noticed it's been a while since your last interaction. We've added new Interlining and Foam Lamination materials that might interest you. Let us know if you'd like us to send some fresh samples.\n\nBest Regards,\nZain Fabrics Team`
        });
        setShowEmailModal(true);
    };

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="min-h-screen bg-bg-main flex items-center justify-center text-brand"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;

    return (
        <div className="min-h-screen bg-bg-main text-primary-text p-8 font-sans transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-serif font-black text-primary-text tracking-tight italic">Manage <span className="text-brand">Customers</span></h1>
                        <p className="text-secondary-text text-sm mt-2 uppercase tracking-widest font-bold">Relationship Management & Communications</p>
                    </div>
                    <div className="relative w-96">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                        <input 
                            type="text" 
                            placeholder="Search by name, email or company..." 
                            className="w-full bg-secondary border border-theme rounded-full py-3 pl-12 pr-6 text-sm text-primary-text focus:outline-none focus:border-brand transition-all font-medium shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-secondary/30 backdrop-blur-md rounded-2xl border border-theme overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/50 text-secondary-text text-[10px] uppercase font-bold tracking-[0.2em] border-b border-theme">
                            <tr>
                                <th className="px-8 py-6">Customer Details</th>
                                <th className="px-8 py-6">Company & GST</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Engagement Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map(customer => (
                                    <tr key={customer._id} className="hover:bg-secondary/20 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand border border-brand/20">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary-text tracking-wide">{customer.name}</p>
                                                    <p className="text-xs text-brand font-medium group-hover:text-brand/80 transition-colors">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-primary-text">{customer.companyName || 'Individual'}</p>
                                            <p className="text-[10px] font-mono text-secondary-text uppercase">{customer.gstNumber || 'N/A'}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${customer.role === 'admin' ? 'bg-purple-500' : 'bg-brand'}`}></div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-text">{customer.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 invisible group-hover:visible transition-all">
                                                <button 
                                                    onClick={() => sendGreeting(customer)}
                                                    className="p-2 bg-brand/10 text-brand border border-brand/20 rounded hover:bg-brand/20 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                                                >
                                                    <Mail size={14} /> Greeting
                                                </button>
                                                <button 
                                                    onClick={() => sendReminder(customer)}
                                                    className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded hover:bg-amber-500/20 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                                                >
                                                    <Clock size={12} /> Reminder
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-20 text-secondary-text italic">No customers found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-main/80 backdrop-blur-sm">
                    <div className="bg-bg-alt border border-theme p-8 rounded-2xl max-w-2xl w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary-text flex items-center gap-3">
                                <Mail className="text-brand" /> Compose Email to {selectedCustomer?.name}
                            </h3>
                            <button onClick={() => setShowEmailModal(false)} className="text-secondary-text hover:text-primary-text transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSendEmail} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-2">Subject</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-bg-main border border-theme rounded-lg p-3 text-sm text-primary-text focus:border-brand outline-none transition-all"
                                    value={emailData.subject}
                                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-2">Message</label>
                                <textarea 
                                    rows={8}
                                    className="w-full bg-bg-main border border-theme rounded-lg p-4 text-sm text-primary-text focus:border-brand outline-none resize-none leading-relaxed transition-all"
                                    value={emailData.message}
                                    onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowEmailModal(false)}
                                    className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-secondary-text hover:text-primary-text transition-colors"
                                >
                                    Discard
                                </button>
                                <button 
                                    type="submit"
                                    disabled={sending}
                                    className="px-8 py-3 bg-brand text-black rounded-lg text-xs font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand/20 active:scale-95"
                                >
                                    {sending ? 'Sending...' : <><CheckCircle size={16} /> Send Dispatch</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerListPage;
