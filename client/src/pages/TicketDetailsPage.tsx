import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Send } from 'lucide-react';
import type { RootState } from '../store';
import { API } from '../config/api';

const TicketDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchTicket = async () => {
        if (!user || !id) return;
        try {
            const res = await fetch(`${API}/tickets/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTicket(data);
            }
        } catch (error) {
            console.error("Error fetching ticket", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket?.replies]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;
        
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/tickets/${id}/reply`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}` 
                },
                body: JSON.stringify({ message: replyMessage })
            });
            
            if (res.ok) {
                const updatedTicket = await res.json();
                setTicket(updatedTicket);
                setReplyMessage('');
            }
        } catch (error) {
            console.error("Error sending reply", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return <div className="min-h-screen bg-primary flex items-center justify-center text-primary">Please login.</div>;
    if (loading) return <div className="min-h-screen bg-primary flex items-center justify-center text-primary">Loading ticket...</div>;
    if (!ticket) return <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-primary"><h2>Ticket not found</h2><Link to="/support" className="text-brand mt-4">Back to Support</Link></div>;

    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const backLink = isAdminRoute ? '/admin/support' : '/support';

    return (
        <div className="min-h-screen bg-primary text-secondary font-sans pt-24 pb-12">
            <div className="container mx-auto px-6 max-w-4xl flex flex-col h-[calc(100vh-100px)]">
                
                {/* Header */}
                <div className="flex-shrink-0 mb-6">
                    <Link to={backLink} className="inline-flex items-center gap-2 text-secondary hover:text-brand transition-colors mb-4 text-sm font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Tickets
                    </Link>
                    
                    <div className="bg-card border border-theme p-6 rounded-xl shadow-lg">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-theme pb-4 mb-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-serif font-bold text-primary">{ticket.subject}</h1>
                                </div>
                                <p className="text-sm text-secondary mt-1 flex items-center gap-2">
                                    <span className="font-mono bg-primary px-2 py-0.5 rounded text-xs">#{ticket._id}</span>
                                    <span>Created {new Date(ticket.createdAt).toLocaleString()}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs uppercase tracking-wider font-bold border border-theme px-3 py-1 rounded">Priority: {ticket.priority}</span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-2 uppercase tracking-wider ${ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'text-green-500 border-green-500/30 bg-green-900/10' : 'text-brand border-brand/30 bg-brand/10'}`}>
                                    {ticket.status}
                                </span>
                            </div>
                        </div>
                        <div className="text-primary prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap">{ticket.description}</p>
                        </div>
                    </div>
                </div>

                {/* Messages Chat Area */}
                <div className="flex-1 bg-card border border-theme rounded-xl overflow-hidden flex flex-col shadow-lg">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {ticket.replies && ticket.replies.length > 0 ? (
                            ticket.replies.map((reply: any, idx: number) => {
                                const isSelf = reply.user._id === user._id || reply.user === user._id;
                                const showAsAdmin = reply.isAdmin;
                                
                                return (
                                    <div key={idx} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold ${showAsAdmin ? 'text-brand' : 'text-secondary'}`}>
                                                {showAsAdmin ? 'Support Team' : reply.user.name || 'User'}
                                            </span>
                                            <span className="text-[10px] text-zinc-500">{new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${isSelf ? 'bg-brand text-black rounded-tr-sm' : 'bg-secondary/10 border border-theme text-primary rounded-tl-sm'}`}>
                                            <p className="whitespace-pre-wrap text-sm">{reply.message}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-full flex items-center justify-center text-secondary text-sm">
                                No replies yet. Support team will respond shortly.
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Input */}
                    {(ticket.status !== 'Closed' && ticket.status !== 'Resolved') || isAdminRoute ? (
                        <div className="p-4 border-t border-theme bg-primary/50">
                            <form onSubmit={handleReply} className="flex gap-4">
                                <textarea 
                                    className="flex-1 bg-primary border border-theme rounded-xl px-4 py-3 text-primary focus:border-brand focus:outline-none resize-none transition-colors"
                                    rows={1}
                                    placeholder="Type your message..."
                                    value={replyMessage}
                                    onChange={(e) => {
                                        setReplyMessage(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    style={{ minHeight: '50px', maxHeight: '150px' }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleReply(e);
                                        }
                                    }}
                                />
                                <button 
                                    type="submit" 
                                    disabled={submitting || !replyMessage.trim()}
                                    className="bg-brand text-black px-6 rounded-xl font-bold hover:opacity-80 transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    <Send size={20} className={submitting ? 'animate-pulse' : ''} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="p-4 border-t border-theme bg-primary/50 text-center text-sm text-secondary">
                            This ticket has been marked as {ticket.status}. No further replies can be added.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TicketDetailsPage;
