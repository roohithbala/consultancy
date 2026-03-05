const SystemStatus = ({ gatewayMode = "Test Mode" }: { gatewayMode?: string }) => {
    return (
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white font-serif mb-4 tracking-wide">System Status</h3>
            <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Database: <span className="text-green-500 font-bold">Connected</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Email Service: <span className="text-green-500 font-bold">Active</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span>Payment Gateway: <span className="text-amber-500 font-bold">{gatewayMode}</span></span>
                </div>
            </div>
        </div>
    );
};

export default SystemStatus;
