import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LifeBuoy, Clock, CheckCircle, Filter } from 'lucide-react';
import type { RootState } from '../../store';
import { API } from '../../config/api';

const AdminTicketsPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchTickets = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/tickets`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setTickets(data);
            } else {
                setTickets([]);
            }
        } catch (error) {
            console.error("Error fetching tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [user]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`${API}/tickets/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}` 
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchTickets();
            }
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const filteredTickets = filterStatus === 'All' 
        ? tickets 
        : tickets.filter(t => t.status === filterStatus);

    return (
        <div className="bg-primary min-h-screen text-secondary p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4 border-b border-theme pb-6">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-primary flex items-center gap-3">
                            <LifeBuoy size={32} className="text-brand" />
                            Support <span className="text-secondary">Tickets</span>
                        </h1>
                        <p className="text-sm uppercase tracking-widest mt-2">{tickets.length} Total Issues</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-card border border-theme text-primary pl-10 pr-4 py-2 rounded focus:outline-none focus:border-brand transition-colors appearance-none"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">Loading tickets...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="bg-card border border-theme rounded-xl p-20 text-center shadow-lg">
                        <CheckCircle size={64} className="mx-auto text-green-500 mb-6" strokeWidth={1} />
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">You're All Caught Up!</h2>
                        <p className="text-secondary font-light">No support tickets match the current criteria.</p>
                    </div>
                ) : (
                    <div className="bg-card border border-theme rounded-xl overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary border-b border-theme uppercase tracking-wider text-xs font-bold text-secondary">
                                        <th className="p-4">Ticket ID</th>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Subject</th>
                                        <th className="p-4">Priority</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Created</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTickets.map((ticket) => (
                                        <tr key={ticket._id} className="border-b border-theme hover:bg-primary/30 transition-colors">
                                            <td className="p-4 font-mono text-xs">{ticket._id.substring(0, 8)}</td>
                                            <td className="p-4 text-sm text-primary">{ticket.user?.name || 'Unknown'}</td>
                                            <td className="p-4 text-sm font-bold text-primary">
                                                {ticket.subject}
                                                {ticket.order && <div className="text-[10px] text-brand uppercase font-mono mt-1 pt-1 opacity-80">Order #{ticket.order._id.substring(0, 8)}</div>}
                                            </td>
                                            <td className="p-4 text-xs font-bold">
                                                <span className={`px-2 py-1 rounded-sm border ${ticket.priority === 'Urgent' ? 'text-red-500 border-red-500/30' : 'text-brand border-brand/30'}`}>{ticket.priority}</span>
                                            </td>
                                            <td className="p-4">
                                                <select 
                                                    value={ticket.status}
                                                    onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                                                    className={`text-xs font-bold px-2 py-1 rounded bg-transparent border uppercase tracking-wider focus:outline-none ${ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'text-green-500 border-green-500/30' : 'text-brand border-brand/30'}`}
                                                >
                                                    <option value="Open" className="bg-primary text-primary">Open</option>
                                                    <option value="In Progress" className="bg-primary text-primary">In Progress</option>
                                                    <option value="Resolved" className="bg-primary text-primary">Resolved</option>
                                                    <option value="Closed" className="bg-primary text-primary">Closed</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-sm text-secondary flex items-center gap-1 mt-1">
                                                <Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link to={`/admin/support/${ticket._id}`} className="text-xs uppercase tracking-widest text-brand hover:text-yellow-500 font-bold border border-brand/30 px-3 py-1.5 rounded transition-colors">
                                                    View Thread
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTicketsPage;
