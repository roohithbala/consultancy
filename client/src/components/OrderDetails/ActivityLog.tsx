interface ActivityLogProps {
    trackingHistory: any[];
}

const ActivityLog = ({ trackingHistory }: ActivityLogProps) => {
    return (
        <div className="bg-black/20 p-6 rounded-lg border border-white/5 mb-8 no-print">
            <h3 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">Activity Log</h3>
            <div className="space-y-6">
                {trackingHistory && trackingHistory.length > 0 ? (
                    trackingHistory.map((h: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start relative pl-4 border-l border-white/10">
                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gold"></div>
                            <div>
                                <p className="font-bold text-sm text-gray-200">{h.status}</p>
                                <p className="text-xs text-gray-400 mt-1">{h.description}</p>
                                <p className="text-[10px] text-gray-600 mt-1 font-mono">{new Date(h.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 italic">No updates available yet.</p>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
