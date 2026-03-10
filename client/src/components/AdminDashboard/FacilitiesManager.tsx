interface FacilitiesManagerProps {
    facilities: {
        razorpay: boolean;
        bankTransfer: boolean;
        emailNotifications: boolean;
        smsNotifications: boolean;
    };
    toggleFacility: (key: any) => void;
}

const FacilitiesManager = ({ facilities, toggleFacility }: FacilitiesManagerProps) => {
    return (
        <div className="bg-secondary border border-theme rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-primary-text font-serif mb-6 tracking-wide underline decoration-brand/30 underline-offset-8">Facilities</h3>
            <div className="space-y-6">
                {Object.entries(facilities).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between group">
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary-text group-hover:text-primary-text transition-colors">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <button
                            onClick={() => toggleFacility(key)}
                            className={`w-12 h-6 rounded-full relative transition-all duration-500 ${value ? 'bg-brand shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-bg-alt border border-theme'}`}
                        >
                            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all duration-500 shadow-lg ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-8 pt-6 border-t border-theme text-[9px] font-bold text-secondary-text italic">
                Manage active payment gateways and notification systems.
            </div>
        </div>
    );
};

export default FacilitiesManager;
