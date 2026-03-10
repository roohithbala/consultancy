import { ArrowUpRight, ListFilter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
    onFilter?: () => void;
    onExport?: () => void;
}

const DashboardHeader = ({ onFilter, onExport }: DashboardHeaderProps) => {
    return (
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-theme pb-8">
            <div>
                <h1 className="text-4xl font-serif font-black text-primary-text tracking-widest uppercase">
                    Admin <span className="text-brand italic font-normal">Console</span>
                </h1>
                <p className="text-secondary-text mt-3 text-[10px] font-black tracking-[0.4em] uppercase">Intelligence &amp; Strategic Control</p>
            </div>
            <div className="flex gap-3 flex-wrap">
                <button
                    onClick={onFilter}
                    className="px-6 py-3 bg-secondary border border-theme rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand hover:bg-bg-alt hover:border-brand/40 transition-all flex items-center gap-2 shadow-sm"
                >
                    <ListFilter size={14} /> Refine View
                </button>
                <Link
                    to="/admin/analytics"
                    className="px-6 py-3 bg-secondary border border-theme rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary-text hover:text-brand hover:border-brand/40 transition-all flex items-center gap-2 shadow-sm"
                >
                    Analytics →
                </Link>
                <button
                    onClick={onExport}
                    className="px-6 py-3 bg-brand text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                >
                    <ArrowUpRight size={14} /> Export Intel
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader;
