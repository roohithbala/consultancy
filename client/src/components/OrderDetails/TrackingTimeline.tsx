import { Truck, CheckCircle } from 'lucide-react';

interface TrackingTimelineProps {
    currentStatus: string;
}

const TrackingTimeline = ({ currentStatus }: TrackingTimelineProps) => {
    const steps = ['Ordered', 'Processing', 'Shipped', 'Out', 'Delivered'];
    const currentStepNum = Math.max(1, steps.indexOf(currentStatus) + 1) || 1;

    return (
        <div className="bg-secondary p-8 rounded-xl border border-theme mb-8 no-print shadow-xl">
            <h2 className="text-xl font-serif font-bold mb-8 flex items-center gap-3 text-primary-text">
                <div className="p-2 bg-brand/10 rounded-full text-brand"><Truck size={20} /></div>
                Tracking Status
            </h2>
            <div className="relative flex justify-between items-center w-full max-w-4xl mx-auto mb-12">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-bg-alt -z-0 rounded-full"></div>
                <div className="absolute top-1/2 left-0 h-1 bg-brand -z-0 transition-all duration-1000 rounded-full" style={{ width: `${(currentStepNum - 1) * 25}%` }}></div>
                {steps.map((step, index) => {
                    const active = index + 1 <= currentStepNum;
                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-3 min-w-[80px]">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 bg-secondary transition-all ${active ? 'border-brand text-brand shadow-lg shadow-brand/20' : 'border-theme text-secondary-text'}`}>
                                {active ? <CheckCircle size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-bg-alt"></div>}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-brand' : 'text-secondary-text'}`}>{step}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TrackingTimeline;
