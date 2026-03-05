import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderItemsListProps {
    orderItems: any[];
}

const OrderItemsList = ({ orderItems }: OrderItemsListProps) => {
    const navigate = useNavigate();

    return (
        <div className="bg-card p-8 rounded-xl border border-white/10 mb-8 no-print shadow-xl">
            <h2 className="text-xl font-serif font-bold mb-8 flex items-center gap-3 text-primary">
                <div className="p-2 bg-gold/10 rounded-full text-gold"><ShoppingBag size={20} /></div>
                Order Items & Customization
            </h2>
            <div className="space-y-6">
                {orderItems.map((item, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => {
                            const params = new URLSearchParams();
                            if (item.color) params.append('color', item.color);
                            if (item.customization) params.append('customization', item.customization);
                            params.append('readonly', 'true');
                            navigate(`/products/${item.product}?${params.toString()}`);
                        }}
                        className="flex flex-col md:flex-row gap-6 p-6 rounded-xl bg-white/5 border border-white/5 hover:border-gold/30 transition-all group cursor-pointer"
                    >
                        <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors">{item.name}</h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">{item.materialType} • {item.type}</p>
                                </div>
                                <p className="text-xl font-mono font-bold text-gold">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                <InfoBox label="Quantity" value={`${item.quantity} ${item.type === 'sample' ? 'Unit' : 'Meters'}`} />
                                {item.color && (
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Selected Color</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: item.color }}></div>
                                            <p className="text-white font-mono text-xs uppercase">{item.color}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {item.customization && (
                                <div className="mt-4 p-4 rounded-lg bg-gold/5 border border-gold/10">
                                    <p className="text-[10px] text-gold uppercase tracking-widest font-bold mb-1">Customization Notes</p>
                                    <p className="text-gray-300 text-sm italic">"{item.customization}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const InfoBox = ({ label, value }: any) => (
    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{label}</p>
        <p className="text-white font-bold">{value}</p>
    </div>
);

export default OrderItemsList;
