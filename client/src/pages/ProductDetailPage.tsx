import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Truck, ShieldCheck, FileText, Download, AlertTriangle, Check, Layers, ArrowRight, MessageCircle, Send } from 'lucide-react';
import FabricViewer from '../components/FabricViewer';
import FootwearConfigurator from '../components/FootwearConfigurator';
import ThreeErrorBoundary from '../components/ThreeErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import ColorTools from '../components/ColorTools';
import type { RootState } from '../store';
import { API } from '../config/api';
import { CATEGORY_FALLBACKS } from '../config/imageFallback';
import { logActivity } from '../utils/activity';

interface Question {
    _id: string;
    question: string;
    answer?: string;
    user: string;
    answeredBy?: string;
    createdAt: string;
    answeredAt?: string;
}

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
    modelUrl?: string;
    samplePrice?: number;
    questions?: Question[];
}

const ProductDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(5);
    const [customization, setCustomization] = useState('');
    const [selectedColor, setSelectedColor] = useState('#10b981');

    // Strict Ordering State
    const [verifiedSamples, setVerifiedSamples] = useState<any[]>([]);
    const [selectedSampleId, setSelectedSampleId] = useState('');
    const [manualSampleId, setManualSampleId] = useState('');
    const [showRiskModal, setShowRiskModal] = useState(false);
    const [riskAccepted, setRiskAccepted] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [viewMode, setViewMode] = useState<'3d' | 'image'>('3d');
    const [activeThumbnail, setActiveThumbnail] = useState(0);
    
    // Q&A State
    const [newQuestion, setNewQuestion] = useState('');
    const [adminAnswer, setAdminAnswer] = useState<{[key: string]: string}>({});
    const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const urlColor = queryParams.get('color');
        const urlCustomization = queryParams.get('customization');
        const isReadOnlyMode = queryParams.get('readonly') === 'true';
        setIsReadOnly(isReadOnlyMode);

        if (urlColor) setSelectedColor(urlColor);
        if (urlCustomization) setCustomization(urlCustomization);

        const fetchProduct = async () => {
            try {
                const res = await fetch(`${API}/products/${id}`);
                const data = await res.json();
                setProduct(data);
                setLoading(false);
                // Log Product View
                logActivity('PRODUCT_VIEW', { 
                    productId: id, 
                    productName: data.name,
                    category: data.materialType 
                });
            } catch (error) {
                console.error("Error fetching product", error);
                setLoading(false);
            }
        };

        const fetchSamples = async () => {
            if (user && id && !isReadOnly) {
                try {
                    const res = await fetch(`${API}/orders/samples/${id}`, {
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
        const price = isSample ? (product.samplePrice || 50) : product.pricePerMeter;
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
            color: selectedColor,
            relatedSampleId: selectedSampleId || manualSampleId,
            isRiskAccepted: riskAccepted
        }));

        setShowRiskModal(false);
        setRiskAccepted(false);
        // Custom UI feedback could replace this window alert in future
        alert(`Request Added: ${isSample ? 'Sample' : 'Fabric Order'}`);
    };

    const handlePostQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestion.trim() || !user || isSubmittingQuestion) return;
        setIsSubmittingQuestion(true);
        try {
            const res = await fetch(`${API}/products/${id}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ question: newQuestion })
            });
            if (res.ok) {
                const data = await res.json();
                setProduct(prev => prev ? { ...prev, questions: data.questions } : null);
                setNewQuestion('');
            }
        } catch (error) { 
            console.error(error); 
        } finally {
            setIsSubmittingQuestion(false);
        }
    };

    const handleAnswerQuestion = async (questionId: string) => {
        if (!adminAnswer[questionId]?.trim() || !user) return;
        try {
            const res = await fetch(`${API}/products/${id}/questions/${questionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ answer: adminAnswer[questionId] })
            });
            if (res.ok) {
                const data = await res.json();
                setProduct(prev => prev ? { ...prev, questions: data.questions } : null);
                setAdminAnswer(prev => ({...prev, [questionId]: ''}));
            }
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="min-h-screen bg-bg-main flex items-center justify-center text-primary-text font-black uppercase tracking-widest text-xs">Loading Specification...</div>;
    if (!product) return <div className="min-h-screen bg-bg-main flex items-center justify-center text-primary-text font-black uppercase tracking-widest text-xs">Product not found</div>;

    return (
        <div className="bg-bg-main min-h-screen pb-20 text-primary-text font-sans selection:bg-brand/30 selection:text-brand transition-colors duration-300">
            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left Column - Visuals */}
                    <div className="lg:w-2/3">
                        <div className="relative h-[650px] bg-[#0a0a0a] border border-theme rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 group">
                            {/* 3D Fabric Viewer or Image */}
                            <div className="absolute inset-0 z-0">
                                <ThreeErrorBoundary>
                                    {viewMode === '3d' ? (
                                        (product.materialType === 'INTERLININGS' || product.materialType === 'JERSEY' || product.materialType === 'FOAM LAMINATIONS' || product.modelUrl) ? (
                                            <FootwearConfigurator 
                                                color={selectedColor} 
                                                modelUrl={product.modelUrl} 
                                                fallbackImage={product.imageUrl}
                                            />
                                        ) : product.textureMaps?.map ? (
                                            <FabricViewer
                                                textureUrl={product.textureMaps.map}
                                                color={selectedColor}
                                                normalMapUrl={product.textureMaps.normalMap}
                                                roughnessMapUrl={product.textureMaps.roughnessMap}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] p-12 text-center">
                                                <div className="w-32 h-32 mb-8 relative">
                                                    <div className="absolute inset-0 bg-brand/20 rounded-full animate-ping"></div>
                                                    <div className="relative bg-brand/10 border border-brand/30 w-full h-full rounded-full flex items-center justify-center">
                                                        <Layers size={48} className="text-brand opacity-50" />
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-serif font-bold text-white mb-4">3D Material Not Available</h3>
                                                <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                                                    This specific material grade is currently being digitized.
                                                    Please refer to the high-resolution gallery and technical specifications below.
                                                </p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-accent-dark/20 backdrop-blur-sm overflow-hidden animate-fade-in group-hover:scale-105 transition-transform duration-1000">
                                            <img 
                                                src={product.imageUrl || CATEGORY_FALLBACKS[product.materialType] || CATEGORY_FALLBACKS['DEFAULT']} 
                                                alt={product.name} 
                                                className="max-w-full max-h-full object-contain drop-shadow-2xl opacity-0 transition-opacity duration-500"
                                                onLoad={(e) => (e.target as HTMLImageElement).classList.add('opacity-100')}
                                                onError={(e) => { (e.target as HTMLImageElement).src = CATEGORY_FALLBACKS[product.materialType] || CATEGORY_FALLBACKS['DEFAULT']; }}
                                            />
                                        </div>
                                    )}
                                </ThreeErrorBoundary>
                            </div>
 
                            <div className="absolute top-8 left-8 z-10">
                                <span className="glass border border-theme text-brand px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
                                    {viewMode === '3d' ? 'Spatial Preview 4K' : 'High-Res Texture 8K'}
                                </span>
                            </div>
 
                            <div className={`absolute bottom-0 left-0 p-8 flex flex-col justify-end pointer-events-none ${viewMode === '3d' && (product.materialType === 'INTERLININGS' || product.materialType === 'JERSEY' || product.materialType === 'FOAM LAMINATIONS' || product.modelUrl) ? 'w-full lg:w-[calc(100%-18rem)] bg-gradient-to-t from-black via-black/40 to-transparent' : 'w-full bg-gradient-to-t from-bg-main/90 via-bg-main/30 to-transparent'}`}>
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] text-primary-text/80 flex items-center gap-3 uppercase tracking-[0.1em] font-black">
                                        <Layers size={16} className="text-brand" strokeWidth={3} />
                                        {viewMode === '3d' ? 'Interactive Render • Zenith Certified' : 'Fabric Surface Detail • Macro Inspection'}
                                    </p>
                                    <div className="flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary-text/20"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary-text/20"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-8 border-b border-theme no-scrollbar">
                            {product.imageUrl && (
                                <button 
                                    onClick={() => { 
                                        setViewMode('image'); 
                                        setActiveThumbnail(0); 
                                        logActivity('3D_MODEL_INTERACTION', { 
                                            productId: product._id, 
                                            productName: product.name, 
                                            type: 'Switch to Image' 
                                        });
                                    }}
                                    className={`w-24 h-24 border ${activeThumbnail === 0 && viewMode === 'image' ? 'border-brand shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-theme'} hover:border-brand/50 transition-all overflow-hidden relative group rounded-xl bg-bg-alt`}
                                >
                                    <img 
                                        src={product.imageUrl || CATEGORY_FALLBACKS[product.materialType] || CATEGORY_FALLBACKS['DEFAULT']} 
                                        className={`w-full h-full object-cover ${activeThumbnail === 0 && viewMode === 'image' ? 'opacity-100' : 'opacity-40'} group-hover:opacity-100 transition-opacity`} 
                                        alt="Fabric Surface" 
                                        onError={(e) => { (e.target as HTMLImageElement).src = CATEGORY_FALLBACKS[product.materialType] || CATEGORY_FALLBACKS['DEFAULT']; }}
                                    />
                                    <div className="absolute inset-0 bg-brand/5 group-hover:bg-transparent transition-colors"></div>
                                </button>
                            )}
                            {(product.materialType === 'INTERLININGS' || product.materialType === 'JERSEY' || product.materialType === 'FOAM LAMINATIONS' || product.modelUrl || product.textureMaps?.map) && (
                                <button 
                                    onClick={() => { 
                                        setViewMode('3d'); 
                                        setActiveThumbnail(1); 
                                        logActivity('3D_MODEL_INTERACTION', { 
                                            productId: product._id, 
                                            productName: product.name, 
                                            type: 'Open 3D' 
                                        });
                                    }}
                                    className={`w-24 h-24 border ${activeThumbnail === 1 && viewMode === '3d' ? 'border-brand shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-theme'} hover:border-brand/50 transition-all overflow-hidden relative group rounded-xl bg-bg-alt/10`}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img src="/3dmodel/t13.png" className={`w-full h-full object-contain p-2 ${activeThumbnail === 1 && viewMode === '3d' ? 'opacity-100' : 'opacity-40'} group-hover:opacity-100 transition-opacity`} alt="3D Configurator" />
                                    </div>
                                    <div className="absolute bottom-2 right-2">
                                        <Layers size={12} className={activeThumbnail === 1 && viewMode === '3d' ? 'text-brand' : 'text-primary-text/20'} />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 py-1 bg-brand/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[7px] text-brand font-black tracking-widest uppercase block text-center">Open 3D</span>
                                    </div>
                                </button>
                            )}
                        </div>

                         <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-primary-text mb-6">Material DNA</h3>
                                <p className="text-secondary-text leading-relaxed font-light text-lg">
                                    {product.description}
                                </p>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-xl font-serif font-bold text-primary-text mb-6">Technical Specs</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-bg-alt/50 p-4 border border-border/10">
                                        <span className="block text-secondary-text/60 text-[10px] uppercase tracking-widest font-black mb-1">Width</span>
                                        <span className="font-bold text-primary-text">{product.width || '58-60'} inches</span>
                                    </div>
                                    <div className="bg-bg-alt/50 p-4 border border-border/10">
                                        <span className="block text-secondary-text/60 text-[10px] uppercase tracking-widest font-black mb-1">GSM</span>
                                        <span className="font-bold text-primary-text">{product.gsm || 'N/A'}</span>
                                    </div>
                                    <div className="bg-bg-alt/50 p-4 border border-border/10">
                                        <span className="block text-secondary-text/60 text-[10px] uppercase tracking-widest font-black mb-1">Origin</span>
                                        <span className="font-bold text-primary-text">India</span>
                                    </div>
                                    <div className="bg-bg-alt/50 p-4 border border-border/10">
                                        <span className="block text-secondary-text/60 text-[10px] uppercase tracking-widest font-black mb-1">Use Case</span>
                                        <span className="font-bold text-primary-text">Shoe Lining</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24 bg-card border border-theme p-10 rounded-[2.5rem] shadow-2xl animate-fade-in transition-colors duration-500">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="text-brand font-black tracking-[0.3em] uppercase text-[10px] px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">{product.materialType}</span>
                                <div className="h-px flex-1 bg-border/10"></div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-8 text-primary-text leading-tight tracking-tight break-words">{product.name}</h1>
                            <div className="flex items-baseline mb-10 pb-10 border-b border-border/10">
                                <span className="text-5xl font-black text-primary-text tracking-tighter italic">₹{product.pricePerMeter}</span>
                                <span className="text-secondary-text ml-3 text-[10px] uppercase font-black tracking-[0.2em] opacity-60">per linear meter</span>
                            </div>

                             {/* Color Customization - Only show if 3D is available */}
                            {(product.materialType === 'INTERLININGS' || product.textureMaps?.map) && (
                                <div className={isReadOnly ? 'pointer-events-none opacity-80' : ''}>
                                    <ColorTools 
                                        color={selectedColor} 
                                        onChange={(color) => {
                                            setSelectedColor(color);
                                            logActivity('3D_MODEL_INTERACTION', { 
                                                productId: product._id, 
                                                productName: product.name, 
                                                type: 'Color Change',
                                                color: color
                                            });
                                        }} 
                                    />
                                </div>
                            )}

                            {/* Customization */}
                            <div className="mt-8 mb-8">
                                <label className="block text-[10px] font-black text-secondary-text/60 uppercase tracking-[0.2em] mb-3">Additional Notes</label>
                                <textarea
                                    className="w-full bg-bg-alt/50 border border-border/10 text-primary-text p-5 focus:border-brand focus:outline-none transition-colors text-sm placeholder:text-secondary-text/30 rounded-xl"
                                    readOnly={isReadOnly}
                                    placeholder={isReadOnly ? "No additional notes." : "Specific requirements (e.g. stiffer feel, darker shade)..."}
                                    value={customization}
                                    onChange={(e) => setCustomization(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Quantity & Actions */}
                            <div className="mb-8">
                                <label className="block text-[10px] font-black text-secondary-text/60 uppercase tracking-[0.2em] mb-3">Quantity (Meters)</label>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex items-center bg-bg-alt/50 border border-border/10 rounded-xl overflow-hidden">
                                        <button onClick={() => setQuantity(Math.max(5, quantity - 5))} className="px-5 py-4 text-primary-text hover:bg-brand hover:text-black transition-all font-black">-</button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="w-20 text-center bg-transparent border-none outline-none text-primary-text font-black text-lg"
                                            min="5"
                                        />
                                        <button onClick={() => setQuantity(quantity + 5)} className="px-5 py-4 text-primary-text hover:bg-brand hover:text-black transition-all font-black">+</button>
                                    </div>
                                    <span className="text-[10px] font-black text-secondary-text/40 uppercase tracking-widest italic">Min Order: 5m</span>
                                </div>
                            </div>

                            {/* Sample Verification */}
                            <div className="mb-8 bg-secondary border border-theme rounded-lg p-5 relative overflow-hidden">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-brand/20 p-1.5 rounded-full text-brand">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold uppercase text-primary-text tracking-widest leading-none">Sample Link</h4>
                                        <p className="text-[10px] text-secondary-text mt-1">Verify quality before bulk purchase</p>
                                    </div>
                                </div>
 
                                {verifiedSamples.length > 0 ? (
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none bg-secondary border border-theme text-primary-text text-sm p-4 pr-10 focus:border-brand outline-none rounded-lg transition-colors cursor-pointer font-mono"
                                            value={selectedSampleId}
                                            onChange={(e) => setSelectedSampleId(e.target.value)}
                                        >
                                            <option value="">-- Select Previous Verified Sample --</option>
                                            {verifiedSamples.map(sample => (
                                                <option key={sample._id} value={sample._id}>
                                                    Sample #{sample._id.substring(0, 6).toUpperCase()} — {new Date(sample.date).toLocaleDateString()}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full bg-secondary border border-theme text-primary-text text-sm p-4 focus:border-brand outline-none rounded-lg placeholder:text-secondary-text/50 font-mono"
                                            placeholder="Enter Sample ID Manually"
                                            value={manualSampleId}
                                            onChange={(e) => setManualSampleId(e.target.value)}
                                        />
                                        <p className="text-[10px] text-red-500/80 mt-2 flex items-center gap-1">
                                            <AlertTriangle size={10} /> No delivered samples found on this account.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {!isReadOnly && user?.role !== 'admin' ? (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => addToCartHandler('regular')}
                                        className="w-full bg-[#10b981] text-black py-5 font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] group"
                                    >
                                        <ShoppingBag size={16} className="group-hover:scale-110 transition-transform" /> Add to Order Collection
                                    </button>
                                    <button
                                        onClick={() => addToCartHandler('sample')}
                                        className="w-full bg-secondary border border-theme text-primary-text py-4 font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:border-brand/50 hover:text-brand transition-all"
                                    >
                                        Secure Verification Sample ({product.samplePrice ? `₹${product.samplePrice}` : 'Comp'})
                                    </button>
                                </div>
                            ) : user?.role === 'admin' ? (
                                <div className="space-y-3">
                                    <div className="p-4 bg-brand/5 border border-brand/20 rounded-xl text-center">
                                        <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">👁 Admin Preview Mode</p>
                                        <p className="text-[9px] text-secondary-text">This is how customers see this product. Ordering is disabled for admins.</p>
                                    </div>
                                    <button
                                        onClick={() => window.history.back()}
                                        className="w-full bg-secondary border border-theme text-secondary-text py-3 font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:border-brand/40 hover:text-brand transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowRight size={14} className="rotate-180" /> Back
                                    </button>
                                </div>
                            ) : null}

                            {/* Trust Badges */}
                            <div className="mt-8 pt-8 border-t border-theme space-y-3">
                                <div className="flex items-center gap-3 text-xs text-secondary-text">
                                    <Truck size={14} className="text-brand" />
                                    <span>Global Shipping (2-5 Days)</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-secondary-text">
                                    <Check size={14} className="text-brand" />
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
                            <FileText size={24} className="text-brand" />
                            <h3 className="text-2xl font-serif font-bold text-primary-text">Certifications &amp; Data Sheets</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {product.documents.map((doc, idx) => (
                                <a
                                    key={idx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-6 bg-card border border-theme hover:border-brand/50 transition-colors group rounded-2xl"
                                >
                                    <span className="text-sm font-bold text-primary-text group-hover:text-brand uppercase tracking-wider">{doc.name}</span>
                                    <Download size={20} className="text-secondary-text group-hover:text-brand transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product Q&A Section */}
                <div className="mt-20 border-t border-theme pt-12">
                    <div className="flex items-center gap-4 mb-8">
                        <MessageCircle size={24} className="text-brand" />
                        <h3 className="text-2xl font-serif font-bold text-primary-text">Customer Questions & Answers</h3>
                    </div>
                    
                    {/* Question List */}
                    <div className="space-y-6 mb-10">
                        {product.questions && product.questions.length > 0 ? (
                            product.questions.map(q => (
                                <div key={q._id} className="bg-bg-alt/50 border border-theme p-6 rounded-2xl">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0 text-brand font-bold text-xs">
                                            Q
                                        </div>
                                        <div>
                                            <p className="text-primary-text font-bold text-lg">{q.question}</p>
                                            <span className="text-xs text-secondary-text">Asked on {new Date(q.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    
                                    {q.answer ? (
                                        <div className="flex items-start gap-4 ml-8 mt-4 pt-4 border-t border-theme border-dashed">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-text font-bold text-xs border border-theme">
                                                A
                                            </div>
                                            <div>
                                                <p className="text-primary-text/90 italic">{q.answer}</p>
                                                <span className="text-[10px] text-secondary-text uppercase tracking-widest font-black mt-2 inline-block px-2 py-0.5 bg-brand/10 text-brand rounded-sm">Zain Fabrics Support</span>
                                            </div>
                                        </div>
                                    ) : user?.role === 'admin' ? (
                                        <div className="ml-12 mt-4 flex gap-3">
                                            <input 
                                                type="text"
                                                className="flex-1 bg-secondary border border-theme rounded-lg px-4 py-2 text-sm text-primary-text focus:border-brand outline-none"
                                                placeholder="Type answer here..."
                                                value={adminAnswer[q._id] || ''}
                                                onChange={(e) => setAdminAnswer({...adminAnswer, [q._id]: e.target.value})}
                                            />
                                            <button 
                                                onClick={() => handleAnswerQuestion(q._id)}
                                                className="bg-brand text-black font-bold uppercase tracking-widest text-[10px] px-4 rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="ml-12 mt-2">
                                            <span className="text-xs text-secondary-text/50 italic">Awaiting answer...</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-secondary-text italic bg-bg-alt/30 p-8 rounded-xl border border-theme border-dashed text-center">No questions have been asked about this material yet.</p>
                        )}
                    </div>

                    {/* Ask Question Form */}
                    {user ? (
                        <form onSubmit={handlePostQuestion} className="bg-card border border-theme p-6 rounded-2xl shadow-xl">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-primary-text mb-4">Ask a Question</h4>
                            <div className="flex gap-4">
                                <input 
                                    type="text"
                                    required
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    className="flex-1 bg-secondary border border-theme rounded-lg px-4 py-3 text-primary-text focus:border-brand outline-none"
                                    placeholder="E.g. What is the typical shrinkage percentage after washing?"
                                />
                                <button type="submit" disabled={isSubmittingQuestion} className="bg-brand text-black font-bold uppercase tracking-widest text-xs px-8 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Send size={16} /> {isSubmittingQuestion ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-brand/5 border border-brand/20 p-6 rounded-2xl text-center">
                            <p className="text-brand font-bold">Please log in to ask a question.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Risk Modal */}
            {/* Risk Acceptance Modal (Premium UI) */}
            {showRiskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
                    <div className="bg-card border border-brand/30 p-8 max-w-lg w-full rounded-xl shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent"></div>

                        <div className="flex items-start gap-5 mb-8">
                            <div className="p-3 bg-red-900/20 rounded-full border border-red-500/30 flex-shrink-0">
                                <AlertTriangle className="text-red-500" size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-primary-text mb-3 tracking-wide">Unverified Order Warning</h3>
                                <p className="text-secondary-text text-sm leading-relaxed font-light">
                                    You are initiating a bulk production run without a linked <span className="text-primary-text font-bold border-b border-theme">Sample ID</span>.
                                    Color matching and texture consistency cannot be guaranteed without a reference sample.
                                </p>
                            </div>
                        </div>

                        <div
                            className={`border p-4 rounded-lg mb-8 cursor-pointer transition-all duration-300 ${riskAccepted ? 'bg-brand/10 border-brand/50' : 'bg-secondary/10 border-theme hover:border-primary/30'}`}
                            onClick={() => setRiskAccepted(!riskAccepted)}
                        >
                            <label className="flex items-start gap-4 cursor-pointer pointer-events-none">
                                <div className={`w-5 h-5 border rounded flex items-center justify-center mt-0.5 transition-all duration-300 ${riskAccepted ? 'bg-brand border-brand scale-110' : 'border-theme bg-transparent'}`}>
                                    {riskAccepted && <Check size={12} className="text-black font-bold" />}
                                </div>
                                <span className={`text-sm ${riskAccepted ? 'text-primary-text font-medium' : 'text-secondary-text'} transition-colors select-none`}>
                                    I acknowledge the risk. I understand that returns are not accepted for non-sampled bulk orders.
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowRiskModal(false)}
                                className="flex-1 py-4 border border-theme text-secondary-text font-bold uppercase tracking-widest text-xs hover:bg-secondary hover:text-primary-text transition-all rounded-lg"
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
