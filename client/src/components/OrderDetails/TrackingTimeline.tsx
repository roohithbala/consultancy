import { Truck, CheckCircle } from 'lucide-react';

interface TrackingTimelineProps {
    currentStatus: string;
}

const TrackingTimeline = ({ currentStatus }: TrackingTimelineProps) => {
    const steps = ['Ordered', 'Processing', 'Shipped', 'Out', 'Delivered'];
    const getStatusStep = (status: string) => {
        const map: { [key: string]: number } = { 'Pending': 1, 'Processing': 2, 'Shipped': 3, 'OutForDelivery': 4, 'Delivered': 5 };
        return map[status] || 1;
    };
    const currentStepNum = getStatusStep(currentStatus);

    return (
        <div className="bg-card p-8 rounded-xl border border-white/10 mb-8 no-print shadow-xl">
            <h2 className="text-xl font-serif font-bold mb-8 flex items-center gap-3 text-primary">
                <div className="p-2 bg-gold/10 rounded-full text-gold"><Truck size={20} /></div>
                Tracking Status
            </h2>
            <div className="relative flex justify-between items-center w-full max-w-4xl mx-auto mb-12">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -z-0 rounded-full"></div>
                <div className="absolute top-1/2 left-0 h-1 bg-gold -z-0 transition-all duration-1000 rounded-full" style={{ width: `${(currentStepNum - 1) * 25}%` }}></div>
                {steps.map((step, index) => {
                    const active = index + 1 <= currentStepNum;
                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-3 min-w-[80px]">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 bg-card transition-all ${active ? 'border-gold text-gold shadow-lg shadow-gold/20' : 'border-gray-700 text-gray-700'}`}>
                                {active ? <CheckCircle size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-gray-700"></div>}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-gold' : 'text-gray-600'}`}>{step}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TrackingTimeline;
