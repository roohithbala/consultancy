import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LifeBuoy, PlusCircle, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import type { RootState } from '../store';
import { API } from '../config/api';

const SupportTicketsPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [orderId, setOrderId] = useState('');
    const [userOrders, setUserOrders] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchTickets = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/tickets/my`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setTickets(data);
            } else {
                setTickets([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tickets", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        
        // Fetch users orders for the dropdown
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const res = await fetch(`${API}/orders/myorders`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (Array.isArray(data)) setUserOrders(data);
            } catch (error) {
                console.error("Error fetching orders", error);
            }
        };
        fetchOrders();
    }, [user]);

    useEffect(() => {
        // Parse orderId from query params
        const searchParams = new URLSearchParams(window.location.search);
        const urlOrderId = searchParams.get('orderId');
        if (urlOrderId) {
            setOrderId(urlOrderId);
            setShowForm(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !description || !orderId) return;
        
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/tickets`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}` 
                },
                body: JSON.stringify({ subject, description, priority, orderId })
            });
            
            if (res.ok) {
                setShowForm(false);
                setSubject('');
                setDescription('');
                setPriority('Medium');
                fetchTickets(); // Refresh list
            }
        } catch (error) {
            console.error("Error creating ticket", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return <div className="min-h-screen bg-primary flex items-center justify-center text-primary">Please login to view support.</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved':
            case 'Closed': return 'text-green-500 bg-green-900/10 border-green-500/30';
            case 'In Progress': return 'text-blue-500 bg-blue-900/10 border-blue-500/30';
            default: return 'text-gold bg-gold/10 border-gold/30'; // Open
        }
    };

    return (
        <div className="min-h-screen bg-primary text-secondary font-sans pt-24 pb-12 transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b border-theme pb-6 gap-4">
                    <div>
                        <span className="text-gold uppercase tracking-[0.2em] text-xs font-bold">Assistance</span>
                        <h1 className="text-4xl font-serif font-bold text-primary mt-2 flex items-center gap-3">
                            <LifeBuoy size={36} className="text-gold" />
                            Support <span className="text-secondary">Tickets</span>
                        </h1>
                    </div>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-gold text-black px-6 py-3 font-bold uppercase tracking-widest hover:bg-yellow-500 transition-all rounded-lg"
                    >
                        {showForm ? 'Cancel' : <><PlusCircle size={18} /> New Ticket</>}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-card border border-theme p-8 rounded-xl mb-12 shadow-lg">
                        <h2 className="text-2xl font-serif font-bold text-primary mb-6">Create New Ticket</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-secondary font-bold mb-2">Subject</label>
                                <input 
                                    type="text" 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-primary border border-theme rounded-lg px-4 py-3 text-primary focus:border-gold focus:outline-none transition-colors" 
                                    placeholder="Brief summary of the issue"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-secondary font-bold mb-2">Description</label>
                                <textarea 
                                    rows={5}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-primary border border-theme rounded-lg px-4 py-3 text-primary focus:border-gold focus:outline-none transition-colors" 
                                    placeholder="Provide detailed information..."
                                    required 
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-secondary font-bold mb-2">Related Order</label>
                                <select 
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full bg-primary border border-theme rounded-lg px-4 py-3 text-primary focus:border-gold focus:outline-none transition-colors"
                                    required
                                >
                                    <option value="" disabled>Select an Order</option>
                                    {userOrders.map((order) => (
                                        <option key={order._id} value={order._id}>
                                            Order #{order._id.substring(0, 8)} - {new Date(order.createdAt).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-secondary font-bold mb-2">Priority</label>
                                <select 
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full bg-primary border border-theme rounded-lg px-4 py-3 text-primary focus:border-gold focus:outline-none transition-colors"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="bg-gold text-black font-bold uppercase tracking-widest px-8 py-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20 text-secondary">Loading tickets...</div>
                ) : tickets.length === 0 && !showForm ? (
                    <div className="bg-card border border-theme rounded-xl p-20 text-center shadow-lg">
                        <MessageSquare size={64} className="mx-auto text-secondary mb-6" strokeWidth={1} />
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">No Support Tickets</h2>
                        <p className="text-secondary font-light text-lg">If you need assistance with an order or have a general inquiry, feel free to open a ticket.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket: any) => (
                            <Link 
                                to={`/support/${ticket._id}`} 
                                key={ticket._id} 
                                className="block group bg-card border border-theme p-6 rounded-xl hover:border-gold/50 transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono text-xs text-secondary border border-theme px-2 py-1 rounded">#{ticket._id.substring(0, 8)}</span>
                                            <h3 className="text-lg font-bold text-primary group-hover:text-gold transition-colors">{ticket.subject}</h3>
                                        </div>
                                        <div className="text-sm text-secondary flex items-center gap-4">
                                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            <span className="text-xs uppercase tracking-wider font-bold">Priority: {ticket.priority}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-2 uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                                            {ticket.status === 'Resolved' || ticket.status === 'Closed' ? <CheckCircle size={14} /> : <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>}
                                            {ticket.status}
                                        </span>
                                        <div className="text-secondary group-hover:text-gold transition-colors flex items-center gap-1 text-sm">
                                            <MessageSquare size={16} /> {ticket.replies?.length || 0}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportTicketsPage;
