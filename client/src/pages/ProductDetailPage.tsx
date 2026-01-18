import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Truck, ShieldCheck, Ruler, FileText, Download } from 'lucide-react';
import FabricViewer from '../components/FabricViewer';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

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
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(5);

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
        fetchProduct();
    }, [id]);

    const addToCartHandler = (type: 'regular' | 'sample' = 'regular') => {
        if (product) {
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
                type: type
            }));
            alert(`Added ${isSample ? 'Sample' : 'Fabric'} to order request!`);
        }
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!product) return <div className="p-20 text-center">Product not found</div>;

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column - 3D Viewer & Images */}
                    <div className="lg:w-2/3">
                        <div className="bg-gray-100 rounded-xl overflow-hidden shadow-inner h-[500px] md:h-[600px] mb-6 relative">
                            {/* 3D Fabric Viewer */}
                            <div className="absolute inset-0 z-0">
                                <FabricViewer
                                    textureUrl={product.textureMaps?.map || "https://media.istockphoto.com/id/1198271727/photo/dark-black-fabric-texture-background-linen.jpg?s=612x612&w=0&k=20&c=d3J_Pds_OaYn3kRzB_C2wB4c7Kz_C4d8y5y_Z8x_Z8x="}
                                    normalMapUrl={product.textureMaps?.normalMap}
                                    roughnessMapUrl={product.textureMaps?.roughnessMap}
                                />
                            </div>

                            <div className="absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm pointer-events-none">
                                Interactive 3D Preview
                            </div>
                        </div>

                        {/* Thumbnails (Placeholder) */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {product.imageUrl && (
                                <button className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-black overflow-hidden flex-shrink-0">
                                    <img src={product.imageUrl} className="w-full h-full object-cover" alt="View 1" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24">
                            <div className="mb-2">
                                <span className="text-accent font-bold tracking-wider uppercase text-sm">{product.materialType}</span>
                            </div>
                            <h1 className="text-4xl font-bold mb-4 text-gray-900">{product.name}</h1>
                            <div className="flex items-baseline mb-6">
                                <span className="text-3xl font-bold">₹{product.pricePerMeter}</span>
                                <span className="text-gray-500 ml-2">/ meter</span>
                            </div>

                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {product.description}
                            </p>

                            {/* Specifications */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Width</span>
                                    <span className="font-semibold">{product.width || '58-60'} inches</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <span className="block text-gray-500 text-xs uppercase font-bold mb-1">GSM</span>
                                    <span className="font-semibold">{product.gsm || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Add to Cart */}
                            <div className="border border-gray-100 rounded-xl p-6 shadow-sm mb-8">
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (Meters)</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg w-max">
                                        <button onClick={() => setQuantity(Math.max(5, quantity - 5))} className="px-4 py-2 text-gray-600 hover:bg-gray-100">-</button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="w-20 text-center border-none outline-none focus:ring-0"
                                            min="5"
                                        />
                                        <button onClick={() => setQuantity(quantity + 5)} className="px-4 py-2 text-gray-600 hover:bg-gray-100">+</button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Minimum order: 5 meters</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button onClick={() => addToCartHandler('regular')} className="w-full bg-black text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        <ShoppingBag size={20} /> Add to Order Request
                                    </button>

                                    <button onClick={() => addToCartHandler('sample')} className="w-full border border-black text-black py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                                        Request Sample ({product.samplePrice ? `₹${product.samplePrice}` : 'Free'})
                                    </button>
                                </div>
                            </div>

                            {/* Documents */}
                            {product.documents && product.documents.length > 0 && (
                                <div className="mb-8 border-t border-gray-100 pt-6">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <FileText size={18} /> Certifications & Downloads
                                    </h3>
                                    <div className="space-y-2">
                                        {product.documents.map((doc, idx) => (
                                            <a
                                                key={idx}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                            >
                                                <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                                                <Download size={16} className="text-gray-400 group-hover:text-accent" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Features */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Truck size={18} className="text-accent" />
                                    <span>Global shipping available (Perundurai, Ambur, International)</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <ShieldCheck size={18} className="text-accent" />
                                    <span>Premium quality guaranteed</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Ruler size={18} className="text-accent" />
                                    <span>Customizable width & specifications</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
