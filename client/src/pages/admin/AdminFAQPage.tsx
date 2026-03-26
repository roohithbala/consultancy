import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MessageCircle, Search, User, CheckCircle, Package, Trash2 } from 'lucide-react';
import type { RootState } from '../../store';
import { API } from '../../config/api';

const AdminFAQPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState('');

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`${API}/products/admin/questions`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            const data = await res.json();
            setQuestions(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleAnswerQuestion = async (e: React.FormEvent, productId: string, questionId: string) => {
        e.preventDefault();
        if (!answerText.trim()) return;

        try {
            const res = await fetch(`${API}/products/${productId}/questions/${questionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify({ answer: answerText })
            });

            if (res.ok) {
                // Refresh list locally to avoid a full fetch
                setQuestions(prev => prev.map(q => {
                    if (q.questionId === questionId) {
                        return { ...q, answer: answerText };
                    }
                    return q;
                }));
                setReplyingTo(null);
                setAnswerText('');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteQuestion = async (productId: string, questionId: string) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            const res = await fetch(`${API}/products/${productId}/questions/${questionId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            if (res.ok) {
                setQuestions(prev => prev.filter(q => q.questionId !== questionId));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredQuestions = questions.filter(q =>  
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.user?.name && q.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
    );

    return (
        <div className="p-8 font-sans text-primary-text bg-bg-main min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-serif font-black tracking-tight italic flex items-center gap-4">
                            Product <span className="text-brand">FAQs</span>
                        </h1>
                        <p className="text-secondary-text text-sm mt-3 uppercase tracking-widest font-bold">Manage product inquiries & customer questions</p>
                    </div>
                    <div className="relative w-80">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                        <input 
                            type="text" 
                            placeholder="Search questions or products..." 
                            className="w-full bg-secondary border border-theme rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-brand transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {filteredQuestions.length > 0 ? (
                        filteredQuestions.map(q => (
                            <div key={q.questionId} className={`bg-secondary/30 backdrop-blur-md border ${!q.answer ? 'border-brand/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-theme'} p-6 rounded-2xl transition-all`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!q.answer ? 'bg-brand text-black' : 'bg-brand/10 text-brand'}`}>
                                            <MessageCircle size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{q.question}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-secondary-text uppercase tracking-widest font-bold">
                                                <span className="flex items-center gap-1"><Package size={12}/> {q.productName}</span>
                                                <span className="w-1 h-1 rounded-full bg-theme"></span>
                                                <span className="flex items-center gap-1"><User size={12}/> {q.user?.name || 'Unknown User'}</span>
                                                <span className="w-1 h-1 rounded-full bg-theme"></span>
                                                <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!q.answer && (
                                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                Needs Answer
                                            </span>
                                        )}
                                        <button 
                                            onClick={() => handleDeleteQuestion(q.productId, q.questionId)} 
                                            className="text-red-500/70 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-colors"
                                            title="Delete Question"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {q.answer ? (
                                    <div className="ml-14 mt-4 p-4 bg-bg-main/50 rounded-xl border border-theme border-dashed relative">
                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-brand">
                                            <CheckCircle size={20} className="bg-bg-main rounded-full" />
                                        </div>
                                        <p className="text-sm italic">{q.answer}</p>
                                        <span className="text-[10px] text-brand uppercase tracking-widest font-black mt-2 inline-block">Zain Fabrics Support</span>
                                    </div>
                                ) : (
                                    <div className="ml-14 mt-4">
                                        {replyingTo === q.questionId ? (
                                            <form onSubmit={(e) => handleAnswerQuestion(e, q.productId, q.questionId)} className="flex gap-3">
                                                <input 
                                                    type="text"
                                                    autoFocus
                                                    placeholder="Type official answer..."
                                                    className="flex-1 bg-bg-main border border-brand/50 rounded-lg px-4 py-2 text-sm focus:border-brand outline-none"
                                                    value={answerText}
                                                    onChange={(e) => setAnswerText(e.target.value)}
                                                />
                                                <button 
                                                    type="submit"
                                                    className="bg-brand text-black px-6 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-white transition-colors"
                                                >
                                                    Publish
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setReplyingTo(null)}
                                                    className="px-4 text-xs font-bold uppercase text-secondary-text hover:text-primary-text transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setReplyingTo(q.questionId);
                                                    setAnswerText('');
                                                }}
                                                className="text-xs font-black uppercase tracking-widest text-brand hover:text-white transition-colors border border-brand/30 px-4 py-2 rounded-lg hover:border-brand"
                                            >
                                                Answer this Question
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-theme border-dashed">
                            <MessageCircle size={48} className="mx-auto text-theme mb-4" />
                            <p className="text-secondary-text uppercase tracking-widest font-bold">No questions found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminFAQPage;
