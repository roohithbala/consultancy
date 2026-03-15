import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
    Activity, User, MousePointer, Box, Clock, TrendingUp, 
    ArrowRight, ChevronLeft, ChevronRight, Filter, Download,
    LogIn, ShoppingCart, MessageSquare, Monitor
} from 'lucide-react';
import type { RootState } from '../../store';
import { API } from '../../config/api';

const UserActivityPage = () => {
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    
    // Filters
    const [filter, setFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedAction, setSelectedAction] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedIP, setSelectedIP] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const fetchLogs = async () => {
        try {
            const queryParams = new URLSearchParams({
                pageNumber: page.toString(),
                keyword: filter,
                user: selectedUser,
                actionType: selectedAction,
                method: selectedMethod,
                path: selectedPath,
                ip: selectedIP,
                startDate,
                endDate
            });

            const res = await fetch(`${API}/activity?${queryParams}`, {
                headers: { Authorization: `Bearer ${currentUser?.token}` }
            });
            const data = await res.json();
            setLogs(data.logs);
            setPages(data.pages);
        } catch (e) { console.error(e); }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API}/activity/stats`, {
                headers: { Authorization: `Bearer ${currentUser?.token}` }
            });
            const data = await res.json();
            setStats(data);
        } catch (e) { console.error(e); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API}/users`, {
                headers: { Authorization: `Bearer ${currentUser?.token}` }
            });
            const data = await res.json();
            setUsers(data.users || []);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            await Promise.all([fetchLogs(), fetchStats(), fetchUsers()]);
            setLoading(false);
        };
        fetchAll();
    }, [page, filter, selectedUser, selectedAction, selectedMethod, selectedPath, selectedIP, startDate, endDate, currentUser?.token]);

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'LOGIN': return <LogIn className="text-emerald-500" size={14} />;
            case 'ORDER_CREATED': return <ShoppingCart className="text-brand" size={14} />;
            case '3D_MODEL_INTERACTION': return <Box className="text-purple-500" size={14} />;
            case 'PRODUCT_VIEW': return <Activity className="text-blue-500" size={14} />;
            case 'CONTACT_FORM_SUBMISSION': return <MessageSquare className="text-orange-500" size={14} />;
            default: return <Monitor className="text-gray-400" size={14} />;
        }
    };

    const formatDetails = (details: any) => {
        if (!details) return '—';
        if (details.productName) return `Product: ${details.productName}`;
        if (details.type) return `Type: ${details.type}`;
        if (details.body?.status) return `Status: ${details.body.status}`;
        return JSON.stringify(details).substring(0, 50) + '...';
    };

    const actionTypes = [
        'LOGIN', 'ORDER_CREATED', '3D_MODEL_INTERACTION', 
        'PRODUCT_VIEW', 'CONTACT_FORM_SUBMISSION', 'PROFILE_UPDATE', 
        'ORDER_STATUS_UPDATE', 'REGISTER'
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
    );

    return (
        <div className="font-sans pb-20">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-theme">
                <div>
                    <h1 className="text-3xl font-black font-serif text-primary-text tracking-widest uppercase">
                        Activity <span className="text-brand italic font-normal">Intelligence</span>
                    </h1>
                    <p className="text-secondary-text text-[10px] mt-1 tracking-widest uppercase flex items-center gap-2">
                        <Monitor size={12} className="text-brand" /> Real-time User Engagement & System Monitoring
                    </p>
                </div>
                <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${showAdvanced ? 'bg-brand text-black border-brand' : 'bg-secondary text-primary-text border-theme hover:border-brand'}`}
                >
                    <Filter size={12} /> {showAdvanced ? 'Hide Advanced' : 'Exhaustive Filtering'}
                </button>
            </header>

            {/* Filter Bar */}
            <div className="bg-secondary border border-theme rounded-[1.5rem] p-6 mb-8 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                        <input 
                            type="text" 
                            placeholder="Omni Search..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full bg-bg-main border border-theme rounded-xl pl-10 pr-4 py-2.5 text-[11px] text-primary-text focus:border-brand outline-none transition-all font-bold uppercase tracking-widest"
                        />
                    </div>
                    
                    <select 
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="bg-bg-main border border-theme rounded-xl px-4 py-2.5 text-[11px] text-primary-text focus:border-brand outline-none font-bold uppercase tracking-widest cursor-pointer"
                    >
                        <option value="">All Users</option>
                        {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                    </select>

                    <select 
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="bg-bg-main border border-theme rounded-xl px-4 py-2.5 text-[11px] text-primary-text focus:border-brand outline-none font-bold uppercase tracking-widest cursor-pointer"
                    >
                        <option value="">All Actions</option>
                        {actionTypes.map(t => (
                            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="flex-1 bg-bg-main border border-theme rounded-xl px-3 py-2.5 text-[10px] text-primary-text focus:border-brand outline-none font-bold uppercase"
                        />
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="flex-1 bg-bg-main border border-theme rounded-xl px-3 py-2.5 text-[10px] text-primary-text focus:border-brand outline-none font-bold uppercase"
                        />
                    </div>

                    <button 
                        onClick={() => {
                            setFilter('');
                            setSelectedUser('');
                            setSelectedAction('');
                            setSelectedMethod('');
                            setSelectedPath('');
                            setSelectedIP('');
                            setStartDate('');
                            setEndDate('');
                        }}
                        className="bg-bg-main text-secondary-text border border-theme font-black uppercase tracking-widest text-[10px] py-2.5 px-6 rounded-xl hover:text-brand hover:border-brand transition-all active:scale-95"
                    >
                        Reset All
                    </button>
                </div>

                {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-theme animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest mb-2 px-1">Control Method</p>
                            <select 
                                value={selectedMethod}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                                className="w-full bg-bg-main border border-theme rounded-xl px-4 py-2.5 text-[11px] text-primary-text focus:border-brand outline-none font-bold uppercase tracking-widest"
                            >
                                <option value="">Any Method</option>
                                <option value="GET">GET (Reads)</option>
                                <option value="POST">POST (Creation/Event)</option>
                                <option value="PUT">PUT (Update)</option>
                                <option value="DELETE">DELETE (Removal)</option>
                            </select>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest mb-2 px-1">Route Identifier (Path)</p>
                            <input 
                                type="text" 
                                placeholder="/api/endpoint"
                                value={selectedPath}
                                onChange={(e) => setSelectedPath(e.target.value)}
                                className="w-full bg-bg-main border border-theme rounded-xl px-4 py-2.5 text-[11px] text-primary-text focus:border-brand outline-none font-bold uppercase tracking-widest"
                            />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest mb-2 px-1">IP Address / Gateway</p>
                            <input 
                                type="text" 
                                placeholder="127.0.0.1"
                                value={selectedIP}
                                onChange={(e) => setSelectedIP(e.target.value)}
                                className="w-full bg-bg-main border border-theme rounded-xl px-4 py-2.5 text-[11px] text-primary-text focus:border-brand outline-none font-bold uppercase tracking-widest"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-secondary border border-theme rounded-[2.5rem] p-6 shadow-xl hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-brand/10 border border-brand/20 rounded-2xl text-brand"><Activity size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Neural Pulse</p>
                                <p className="text-2xl font-black text-primary-text italic tracking-tighter">{stats.totalInteractions}</p>
                            </div>
                        </div>
                        <p className="text-[9px] text-secondary-text uppercase tracking-widest italic">Total Registered Events</p>
                    </div>
                    <div className="bg-secondary border border-theme rounded-[2.5rem] p-6 shadow-xl hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-500"><Box size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest">3D Dynamics</p>
                                <p className="text-2xl font-black text-primary-text italic tracking-tighter">{stats.threeDInteractions}</p>
                            </div>
                        </div>
                        <p className="text-[9px] text-secondary-text uppercase tracking-widest italic">Spatial Config Mastery</p>
                    </div>
                    <div className="bg-secondary border border-theme rounded-[2.5rem] p-6 shadow-xl hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-500"><User size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Active Cohort</p>
                                <p className="text-2xl font-black text-primary-text italic tracking-tighter">{stats.topUsers.length}</p>
                            </div>
                        </div>
                        <p className="text-[9px] text-secondary-text uppercase tracking-widest italic">Unique Engaged Entities</p>
                    </div>
                    <div className="bg-secondary border border-theme rounded-[2.5rem] p-6 shadow-xl hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500"><TrendingUp size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Velocity</p>
                                <p className="text-2xl font-black text-primary-text italic tracking-tighter">{(stats.totalInteractions / 30).toFixed(1)}</p>
                            </div>
                        </div>
                        <p className="text-[9px] text-secondary-text uppercase tracking-widest italic">Events Frequency / Day</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Activity Feed */}
                <div className="lg:w-2/3">
                    <div className="bg-secondary border border-theme rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-theme flex items-center justify-between">
                            <h2 className="text-sm font-black text-primary-text uppercase tracking-widest flex items-center gap-2">
                                <Clock size={16} className="text-brand" /> Neural Activity Feed
                            </h2>
                            <button className="text-[10px] font-black text-secondary-text uppercase tracking-widest hover:text-brand transition-colors">
                                <Download size={14} className="inline mr-1" /> Export Analysis
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-bg-main text-secondary-text text-[9px] uppercase font-black tracking-widest border-b border-theme">
                                    <tr>
                                        <th className="px-8 py-4">Timeline</th>
                                        <th className="px-8 py-4">Entity</th>
                                        <th className="px-8 py-4">Operation</th>
                                        <th className="px-8 py-4">Intelligence</th>
                                        <th className="px-8 py-4 text-right">Contextual Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-theme">
                                    {logs.length > 0 ? logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-bg-alt/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <p className="text-[10px] font-bold text-primary-text">{new Date(log.createdAt).toLocaleTimeString()}</p>
                                                <p className="text-[9px] text-secondary-text uppercase tracking-widest">{new Date(log.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                {log.user ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-[10px]">
                                                            {log.user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-primary-text">{log.user.name}</p>
                                                            <p className="text-[9px] text-secondary-text">{log.user.email}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] text-secondary-text/40 font-black uppercase tracking-widest">Anonymous Entity</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {getActionIcon(log.action)}
                                                    <span className="text-[10px] font-black text-primary-text uppercase tracking-widest whitespace-nowrap">{log.action.replace(/_/g, ' ')}</span>
                                                </div>
                                                {log.method && (
                                                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border mt-1 inline-block ${
                                                        log.method === 'GET' ? 'border-blue-500/30 text-blue-500' :
                                                        log.method === 'POST' ? 'border-emerald-500/30 text-emerald-500' :
                                                        log.method === 'DELETE' ? 'border-red-500/30 text-red-500' :
                                                        'border-orange-500/30 text-orange-500'
                                                    }`}>
                                                        {log.method}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs text-secondary-text max-w-xs">{formatDetails(log.details)}</p>
                                                {log.path && <p className="text-[9px] font-mono text-secondary-text/40 mt-1 truncate max-w-[150px]">{log.path}</p>}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="text-[9px] font-mono text-secondary-text uppercase tracking-widest">{log.ip}</p>
                                                <p className="text-[8px] text-secondary-text/30 truncate w-32 ml-auto lowercase font-mono" title={log.userAgent}>
                                                    {log.userAgent?.split(' ')[0]}
                                                </p>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <p className="text-xs text-secondary-text uppercase tracking-[0.2em] font-black">No neural activity records match the defined criteria</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="p-8 border-t border-theme flex items-center justify-between">
                            <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Sync Layer {page} / {pages}</p>
                            <div className="flex gap-2">
                                <button 
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-2 border border-theme rounded-lg text-secondary-text hover:text-brand disabled:opacity-30 transition-all shadow-md active:scale-95"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    disabled={page === pages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 border border-theme rounded-lg text-secondary-text hover:text-brand disabled:opacity-30 transition-all shadow-md active:scale-95"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="lg:w-1/3 space-y-8">
                    {/* Top Products */}
                    <div className="bg-secondary border border-theme rounded-[2.5rem] p-8 shadow-2xl">
                        <h3 className="text-sm font-black text-primary-text uppercase tracking-widest mb-8 flex items-center gap-2">
                            <MousePointer size={16} className="text-brand" /> Market Resonance
                        </h3>
                        <div className="space-y-6">
                            {stats?.topProducts.map((p: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-bg-main border border-theme rounded-xl flex items-center justify-center font-black text-brand italic shadow-inner">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-primary-text group-hover:text-brand transition-colors">{p._id}</p>
                                            <p className="text-[9px] text-secondary-text uppercase tracking-widest italic">{p.count} resonance signals</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={12} className="text-secondary-text opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Users */}
                    <div className="bg-secondary border border-theme rounded-[2.5rem] p-8 shadow-2xl">
                        <h3 className="text-sm font-black text-primary-text uppercase tracking-widest mb-8 flex items-center gap-2">
                            <User size={16} className="text-brand" /> Engagement Leaders
                        </h3>
                        <div className="space-y-6">
                            {stats?.topUsers.map((u: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand/5 border border-brand/20 rounded-full flex items-center justify-center text-brand font-black group-hover:bg-brand group-hover:text-black transition-all">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-primary-text">{u.name}</p>
                                            <p className="text-[9px] text-secondary-text lowercase opacity-60 truncate w-32">{u.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full group-hover:border-brand transition-all">
                                        {u.count} events
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserActivityPage;
