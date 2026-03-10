interface ActivityLogProps {
    trackingHistory: any[];
}

const ActivityLog = ({ trackingHistory }: ActivityLogProps) => {
    return (
        <div className="bg-secondary p-6 rounded-lg border border-theme mb-8 no-print shadow-xl">
            <h3 className="font-bold mb-4 text-primary-text text-sm uppercase tracking-wider">Activity Log</h3>
            <div className="space-y-6">
                {trackingHistory && trackingHistory.length > 0 ? (
                    trackingHistory.map((h: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start relative pl-4 border-l border-theme">
                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-brand"></div>
                            <div>
                                <p className="font-bold text-sm text-primary-text">{h.status}</p>
                                <p className="text-xs text-secondary-text mt-1">{h.description}</p>
                                <p className="text-[10px] text-secondary-text mt-1 font-mono opacity-60">{new Date(h.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-secondary-text italic">No updates available yet.</p>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
