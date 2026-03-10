const SystemStatus = ({ gatewayMode = "Test Mode" }: { gatewayMode?: string }) => {
    return (
        <div className="bg-secondary border border-theme rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-primary-text font-serif mb-6 tracking-wide underline decoration-brand/30 underline-offset-8">System Status</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-secondary-text">
                    <span className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    <span>Database: <span className="text-brand">Connected</span></span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-secondary-text">
                    <span className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    <span>Email Service: <span className="text-brand">Active</span></span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-secondary-text">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                    <span>Gateway: <span className="text-amber-600">{gatewayMode}</span></span>
                </div>
            </div>
        </div>
    );
};

export default SystemStatus;
