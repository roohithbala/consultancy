import { useState, useEffect } from 'react';
import { X, Save, Edit3, ShoppingBag, Info, AlertCircle } from 'lucide-react';
import FootwearConfigurator from './FootwearConfigurator';
import ThreeErrorBoundary from './ThreeErrorBoundary';
import ColorTools from './ColorTools';
import { useDispatch } from 'react-redux';
import { updateCartItem } from '../store/cartSlice';
import { API } from '../config/api';

interface CartEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
}

const CartEditModal = ({ isOpen, onClose, item }: CartEditModalProps) => {
    const dispatch = useDispatch();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editQuantity, setEditQuantity] = useState(item.quantity);
    const [editColor, setEditColor] = useState(item.color || '#10b981');
    const [editCustomization, setEditCustomization] = useState(item.customization || '');

    useEffect(() => {
        if (isOpen && item) {
            setEditQuantity(item.quantity);
            setEditColor(item.color || '#10b981');
            setEditCustomization(item.customization || '');
            
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`${API}/products/${item.id}`);
                    const data = await res.json();
                    setProduct(data);
                } catch (error) {
                    console.error("Error fetching product details", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [isOpen, item]);

    const handleUpdate = () => {
        dispatch(updateCartItem({
            id: item.id,
            type: item.type,
            oldCustomization: item.customization,
            oldColor: item.color,
            newQuantity: editQuantity,
            newColor: editColor,
            newCustomization: editCustomization
        }));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-bg-main/95 backdrop-blur-xl animate-fade-in">
            <div className="bg-bg-main border border-theme w-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.15)] flex flex-col relative">
                
                {/* Header */}
                <div className="p-6 border-b border-theme flex justify-between items-center bg-secondary/30">
                    <div>
                        <h2 className="text-2xl font-serif font-black text-primary-text italic tracking-tighter flex items-center gap-3">
                            <Edit3 className="text-brand" size={24} /> Edit Item
                        </h2>
                        <p className="text-[10px] text-secondary-text uppercase tracking-[0.3em] font-bold mt-1">Configuring: {item.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors text-secondary-text hover:text-primary-text">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-brand">
                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mb-4"></div>
                             <p className="text-[10px] uppercase tracking-widest font-black">Re-initializing Workspace...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Side: 3D View */}
                            <div className="space-y-6">
                                <div className="rounded-2xl overflow-hidden border border-theme shadow-2xl bg-secondary/20">
                                    <ThreeErrorBoundary>
                                        <FootwearConfigurator 
                                            color={editColor} 
                                            modelUrl={product?.modelUrl}
                                            fallbackImage={item.image}
                                        />
                                    </ThreeErrorBoundary>
                                </div>
                                <div className="bg-brand/5 border border-brand/10 p-4 rounded-xl flex gap-4">
                                    <Info className="text-brand flex-shrink-0" size={18} />
                                    <p className="text-[11px] text-brand/80 leading-relaxed italic">
                                        Use the preview for changes before saving.
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Edit Controls */}
                            <div className="flex flex-col gap-10">
                                {/* Color Selection */}
                                <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></div>
                                        Material Shade
                                    </h3>
                                    <ColorTools color={editColor} onChange={setEditColor} />
                                </div>

                                {/* Quantity Control */}
                                <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></div>
                                        Quantity ({item.type === 'sample' ? 'Units' : 'Meters'})
                                    </h3>
                                    {item.type === 'regular' ? (
                                         <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-secondary border border-theme rounded-xl p-1">
                                                <button
                                                    onClick={() => setEditQuantity(Math.max(5, editQuantity - 5))}
                                                    className="w-12 h-12 flex items-center justify-center hover:bg-bg-main text-primary-text transition-colors rounded-lg font-bold"
                                                >-</button>
                                                <input
                                                    type="number"
                                                    value={editQuantity}
                                                    onChange={(e) => setEditQuantity(Math.max(5, parseInt(e.target.value) || 5))}
                                                    className="w-16 bg-transparent border-none text-center text-primary-text font-black text-lg outline-none"
                                                />
                                                <button
                                                    onClick={() => setEditQuantity(editQuantity + 5)}
                                                    className="w-12 h-12 flex items-center justify-center hover:bg-bg-main text-primary-text transition-colors rounded-lg font-bold"
                                                >+</button>
                                            </div>
                                            <p className="text-[10px] text-secondary-text uppercase tracking-widest font-bold">MOQ: 5m Requirement</p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center gap-4">
                                            <ShoppingBag className="text-blue-400" size={20} />
                                            <div>
                                                <p className="text-white font-bold text-sm">1 Sample Unit</p>
                                                <p className="text-[10px] text-blue-400 uppercase tracking-widest mt-0.5">Verified Configuration</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Customization */}
                                 <div>
                                    <h3 className="text-xs font-black text-primary-text uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></div>
                                        Additional Notes
                                    </h3>
                                    <textarea
                                        value={editCustomization}
                                        onChange={(e) => setEditCustomization(e.target.value)}
                                        className="w-full bg-secondary border border-theme p-4 rounded-xl text-sm text-secondary-text focus:border-brand focus:bg-secondary/50 outline-none transition-all resize-none leading-relaxed"
                                        placeholder="Add specific requirements for this item..."
                                        rows={4}
                                    />
                                    <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                                        <AlertCircle size={12} />
                                        <span>Customizations will be re-verified by our technical team</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-theme bg-secondary/30 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col">
                        <p className="text-xs text-secondary-text/60 font-bold uppercase tracking-widest">Price Estimate</p>
                        <p className="text-3xl font-serif font-black text-brand italic tracking-tighter">₹{(item.price * editQuantity).toLocaleString()}</p>
                    </div>
                     <div className="flex gap-4 w-full sm:w-auto">
                        <button 
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text hover:text-primary-text transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleUpdate}
                            className="flex-1 sm:flex-none bg-brand text-black px-12 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-[0_20px_50px_rgba(16,185,129,0.2)] hover:bg-white hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
                        >
                            <Save size={18} className="group-hover:scale-110 transition-transform" /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartEditModal;
