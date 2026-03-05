import { ArrowUpRight, ListFilter } from 'lucide-react';

interface DashboardHeaderProps {
    onFilter?: () => void;
    onExport?: () => void;
}

const DashboardHeader = ({ onFilter, onExport }: DashboardHeaderProps) => {
    return (
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div>
                <h1 className="text-4xl font-bold font-serif text-white tracking-wide">
                    Admin <span className="text-gold">Dashboard</span>
                </h1>
                <p className="text-gray-400 mt-2 text-sm tracking-widest uppercase">Overview & Management</p>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={onFilter}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-gold hover:bg-white/10 transition-all flex items-center gap-2"
                >
                    <ListFilter size={14} /> Filter
                </button>
                <button 
                    onClick={onExport}
                    className="px-5 py-2.5 bg-gold text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                    <ArrowUpRight size={14} /> Export Report
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader;
