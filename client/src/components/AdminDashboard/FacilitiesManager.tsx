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
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white font-serif mb-6 tracking-wide">Facilities</h3>
            <div className="space-y-4">
                {Object.entries(facilities).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between group">
                        <span className="text-sm text-gray-400 capitalize group-hover:text-gray-200 transition-colors">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <button
                            onClick={() => toggleFacility(key)}
                            className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${value ? 'bg-gold' : 'bg-gray-700'}`}
                        >
                            <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-500">
                Manage active payment gateways and notification systems.
            </div>
        </div>
    );
};

export default FacilitiesManager;
