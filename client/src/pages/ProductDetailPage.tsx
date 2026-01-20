import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Truck, ShieldCheck, FileText, Download, AlertTriangle, Check, Layers, ArrowRight } from 'lucide-react';
import FabricViewer from '../components/FabricViewer';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import type { RootState } from '../store';

interface Product {
    _id: string;
    name: string;
    description: string;
    pricePerMeter: number;
    width: string;
    gsm: number;
    materialType: string;
    imageUrl: string;
    textureMaps?: {
        map?: string;
        normalMap?: string;
        roughnessMap?: string;
    };
    documents?: {
        name: string;
        url: string;
    }[];
    samplePrice?: number;
}

const ProductDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(5);
    const [customization, setCustomization] = useState('');

    // Strict Ordering State
    const [verifiedSamples, setVerifiedSamples] = useState<any[]>([]);
    const [selectedSampleId, setSelectedSampleId] = useState('');
    const [manualSampleId, setManualSampleId] = useState('');
    const [showRiskModal, setShowRiskModal] = useState(false);
    const [riskAccepted, setRiskAccepted] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`);
                const data = await res.json();
                setProduct(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching product", error);
                setLoading(false);
            }
        };

        const fetchSamples = async () => {
            if (user && id) {
                try {
                    const res = await fetch(`http://localhost:5000/api/orders/samples/${id}`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setVerifiedSamples(data);
                    }
                } catch (error) {
                    console.error("Error fetching samples", error);
                }
            }
        };

        fetchProduct();
        fetchSamples();
    }, [id, user]);

    const addToCartHandler = (type: 'regular' | 'sample' = 'regular') => {
        if (!product) return;

        if (type === 'regular') {
            // Strict Logic Check
            if (!selectedSampleId && !manualSampleId && !riskAccepted) {
                setShowRiskModal(true);
                return;
            }
        }

        const isSample = type === 'sample';
        const price = isSample ? (product.samplePrice || 0) : product.pricePerMeter;
        const qty = isSample ? 1 : quantity;

        dispatch(addToCart({
            id: product._id,
            name: product.name,
            price: price,
            quantity: qty,
            image: product.imageUrl,
            materialType: product.materialType,
            type: type,
            customization: customization,
            relatedSampleId: selectedSampleId || manualSampleId,
            isRiskAccepted: riskAccepted
        }));

        setShowRiskModal(false);
        setRiskAccepted(false);
        // Custom UI feedback could replace this window alert in future
        alert(`Request Added: ${isSample ? 'Sample' : 'Fabric Order'}`);
    };

    if (loading) return <div className="min-h-screen bg-primary flex items-center justify-center text-primary">Loading Specification...</div>;
    if (!product) return <div className="min-h-screen bg-primary flex items-center justify-center text-primary">Product not found</div>;

    return (
        <div className="bg-primary min-h-screen pb-20 text-secondary font-sans selection:bg-gold selection:text-black transition-colors duration-300">
            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left Column - Visuals */}
                    <div className="lg:w-2/3">
                        <div className="relative h-[600px] bg-card border border-theme overflow-hidden shadow-2xl mb-8 group">
                            {/* 3D Fabric Viewer or Image */}
                            <div className="absolute inset-0 z-0">
                                <FabricViewer
                                    textureUrl={product.textureMaps?.map || "https://media.istockphoto.com/id/1198271727/photo/dark-black-fabric-texture-background-linen.jpg?s=612x612&w=0&k=20&c=d3J_Pds_OaYn3kRzB_C2wB4c7Kz_C4d8y5y_Z8x_Z8x="}
                                    normalMapUrl={product.textureMaps?.normalMap}
                                    roughnessMapUrl={product.textureMaps?.roughnessMap}
                                />
                            </div>

                            <div className="absolute top-6 left-6 z-10">
                                <span className="bg-gold text-black px-4 py-1 text-xs font-bold uppercase tracking-widest">
                                    Interactive 3D
                                </span>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-sm text-gray-300 flex items-center gap-2">
                                    <Layers size={16} className="text-gold" />
                                    Drag to rotate • Scroll to zoom
                                </p>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2 border-b border-white/10 pb-8">
                            {product.imageUrl && (
                                <button className="w-24 h-24 border border-gold/50 hover:border-gold transition-colors overflow-hidden relative group">
                                    <img src={product.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="View 1" />
                                </button>
                            )}
                        </div>

                        {/* Description & Features */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-primary mb-6">Material DNA</h3>
                                <p className="text-secondary leading-relaxed font-light text-lg">
                                    {product.description}
                                </p>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-xl font-serif font-bold text-primary mb-6">Technical Specs</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-card/50 p-4 border border-theme">
                                        <span className="block text-secondary text-xs uppercase tracking-widest mb-1">Width</span>
                                        <span className="font-bold text-primary">{product.width || '58-60'} inches</span>
                                    </div>
                                    <div className="bg-card/50 p-4 border border-theme">
                                        <span className="block text-secondary text-xs uppercase tracking-widest mb-1">GSM</span>
                                        <span className="font-bold text-primary">{product.gsm || 'N/A'}</span>
                                    </div>
                                    <div className="bg-card/50 p-4 border border-theme">
                                        <span className="block text-secondary text-xs uppercase tracking-widest mb-1">Origin</span>
                                        <span className="font-bold text-primary">India</span>
                                    </div>
                                    <div className="bg-card/50 p-4 border border-theme">
                                        <span className="block text-secondary text-xs uppercase tracking-widest mb-1">Use Case</span>
                                        <span className="font-bold text-primary">Shoe Lining</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24 bg-card/80 backdrop-blur-md border border-theme p-8 shadow-lg">
                            <div className="mb-4">
                                <span className="text-gold font-bold tracking-[0.2em] uppercase text-xs">{product.materialType}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-primary leading-tight">{product.name}</h1>
                            <div className="flex items-baseline mb-8 pb-8 border-b border-theme">
                                <span className="text-4xl font-bold text-primary">₹{product.pricePerMeter}</span>
                                <span className="text-secondary ml-2 text-sm uppercase tracking-widest">/ meter</span>
                            </div>

                            {/* Customization */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-3">Customization Notes</label>
                                <textarea
                                    className="w-full bg-secondary/10 border border-theme text-primary p-4 focus:border-gold focus:outline-none transition-colors text-sm placeholder:text-secondary/50"
                                    rows={2}
                                    placeholder="Specific requirements (e.g. stiffer feel, darker shade)..."
                                    value={customization}
                                    onChange={(e) => setCustomization(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Quantity & Actions */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-3">Quantity (Meters)</label>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex items-center bg-secondary/10 border border-theme">
                                        <button onClick={() => setQuantity(Math.max(5, quantity - 5))} className="px-4 py-3 text-primary hover:bg-secondary/20 transition-colors">-</button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="w-16 text-center bg-transparent border-none outline-none text-primary font-bold"
                                            min="5"
                                        />
                                        <button onClick={() => setQuantity(quantity + 5)} className="px-4 py-3 text-primary hover:bg-secondary/20 transition-colors">+</button>
                                    </div>
                                    <span className="text-xs text-secondary">Min: 5m</span>
                                </div>
                            </div>

                            {/* Sample Verification */}
                            <div className="mb-8 bg-card/50 p-5 border border-theme/50 rounded-lg relative overflow-hidden group hover:border-gold/30 transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gold/20 p-1.5 rounded-full text-gold">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold uppercase text-primary tracking-widest leading-none">Sample Link</h4>
                                        <p className="text-[10px] text-gray-500 mt-1">Verify quality before bulk purchase</p>
                                    </div>
                                </div>

                                {verifiedSamples.length > 0 ? (
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none bg-black/40 border border-theme text-primary text-sm p-4 pr-10 focus:border-gold outline-none rounded transition-colors cursor-pointer hover:bg-black/60 font-mono"
                                            value={selectedSampleId}
                                            onChange={(e) => setSelectedSampleId(e.target.value)}
                                        >
                                            <option value="" className="bg-gray-900 text-gray-400">-- Select Previous Verified Sample --</option>
                                            {verifiedSamples.map(sample => (
                                                <option key={sample._id} value={sample._id} className="bg-gray-900 text-white">
                                                    Sample #{sample._id.substring(0, 6).toUpperCase()} — {new Date(sample.date).toLocaleDateString()}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full bg-black/40 border border-theme text-primary text-sm p-4 focus:border-gold outline-none rounded placeholder:text-gray-600 font-mono"
                                            placeholder="Enter Sample ID Manually"
                                            value={manualSampleId}
                                            onChange={(e) => setManualSampleId(e.target.value)}
                                        />
                                        <p className="text-[10px] text-red-400/80 mt-2 flex items-center gap-1">
                                            <AlertTriangle size={10} /> No delivered samples found on this account.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => addToCartHandler('regular')}
                                    className="w-full bg-gold text-black py-4 font-bold uppercase tracking-widest hover:bg-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={18} /> Add to Quote
                                </button>
                                <button
                                    onClick={() => addToCartHandler('sample')}
                                    className="w-full bg-transparent border border-white/30 text-white py-3 font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-colors text-xs"
                                >
                                    Request Sample Only ({product.samplePrice ? `₹${product.samplePrice}` : 'Free'})
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <Truck size={14} className="text-gold" />
                                    <span>Global Shipping (2-5 Days)</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <Check size={14} className="text-gold" />
                                    <span>Certified Quality Inspection</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documents Section */}
                {product.documents && product.documents.length > 0 && (
                    <div className="mt-20 border-t border-theme pt-12">
                        <div className="flex items-center gap-4 mb-8">
                            <FileText size={24} className="text-gold" />
                            <h3 className="text-2xl font-serif font-bold text-primary">Certifications & Data Sheets</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {product.documents.map((doc, idx) => (
                                <a
                                    key={idx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-6 bg-card border border-theme hover:border-gold/50 transition-colors group"
                                >
                                    <span className="text-sm font-bold text-secondary group-hover:text-primary uppercase tracking-wider">{doc.name}</span>
                                    <Download size={20} className="text-secondary group-hover:text-gold transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Risk Modal */}
            {/* Risk Acceptance Modal (Premium UI) */}
            {showRiskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
                    <div className="bg-card border border-gold/30 p-8 max-w-lg w-full rounded-xl shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>

                        <div className="flex items-start gap-5 mb-8">
                            <div className="p-3 bg-red-900/20 rounded-full border border-red-500/30 flex-shrink-0">
                                <AlertTriangle className="text-red-500" size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-primary mb-3 tracking-wide">Unverified Order Warning</h3>
                                <p className="text-secondary text-sm leading-relaxed font-light">
                                    You are initiating a bulk production run without a linked <span className="text-primary font-bold border-b border-theme">Sample ID</span>.
                                    Color matching and texture consistency cannot be guaranteed without a reference sample.
                                </p>
                            </div>
                        </div>

                        <div
                            className={`border p-4 rounded-lg mb-8 cursor-pointer transition-all duration-300 ${riskAccepted ? 'bg-gold/10 border-gold/50' : 'bg-secondary/10 border-theme hover:border-primary/30'}`}
                            onClick={() => setRiskAccepted(!riskAccepted)}
                        >
                            <label className="flex items-start gap-4 cursor-pointer pointer-events-none">
                                <div className={`w-5 h-5 border rounded flex items-center justify-center mt-0.5 transition-all duration-300 ${riskAccepted ? 'bg-gold border-gold scale-110' : 'border-gray-500 bg-transparent'}`}>
                                    {riskAccepted && <Check size={12} className="text-black font-bold" />}
                                </div>
                                <span className={`text-sm ${riskAccepted ? 'text-primary font-medium' : 'text-secondary'} transition-colors select-none`}>
                                    I acknowledge the risk. I understand that returns are not accepted for non-sampled bulk orders.
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowRiskModal(false)}
                                className="flex-1 py-4 border border-theme text-secondary font-bold uppercase tracking-widest text-xs hover:bg-secondary/10 hover:text-primary transition-all rounded-lg"
                            >
                                Cancel Order
                            </button>
                            <button
                                onClick={() => {
                                    if (riskAccepted) addToCartHandler('regular');
                                }}
                                disabled={!riskAccepted}
                                className={`flex-1 py-4 font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 rounded-lg
                                    ${riskAccepted
                                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/40 hover:scale-[1.02]'
                                        : 'bg-secondary/20 text-secondary cursor-not-allowed'
                                    }`}
                            >
                                Confirm Anyway {riskAccepted && <ArrowRight size={14} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
