import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, X, Check } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    description: string;
    pricePerMeter: number;
    imageUrl: string;
    materialType: string;
}

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Sort State
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<number>(5000);
    const [sortBy, setSortBy] = useState<string>('newest');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/products');
                const data = await res.json();
                setProducts(data);
                setFilteredProducts(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching products", error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Apply Filters & Sort
    useEffect(() => {
        let result = [...products];

        // 1. Filter by Material
        if (selectedMaterials.length > 0) {
            result = result.filter(p => selectedMaterials.includes(p.materialType));
        }

        // 2. Filter by Price
        result = result.filter(p => p.pricePerMeter <= priceRange);

        // 3. Sort
        if (sortBy === 'price-low') {
            result.sort((a, b) => a.pricePerMeter - b.pricePerMeter);
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => b.pricePerMeter - a.pricePerMeter);
        }

        setFilteredProducts(result);
    }, [products, selectedMaterials, priceRange, sortBy]);

    const toggleMaterial = (type: string) => {
        setSelectedMaterials(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    return (
        <div className="bg-primary min-h-screen text-secondary font-sans selection:bg-gold selection:text-black transition-colors duration-300">
            {/* Header */}
            <div className="relative py-20 bg-secondary overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-60 dark:opacity-60 opacity-0"></div>
                {/* Note: I removed opacity-60 for Light Mode by defaulting to opacity-0 if not dark, but wait, opacity-0 means no gradient. 
                   Actually, let's just make the background `bg-secondary` (gray-100 in light) which is fine. 
                   If we want the dark gradient only in drak mode: dark:block hidden? 
                   Let's just settle on: bg-secondary for light mode is clean. 
                */}
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block animate-fade-in">Global Standard</span>
                    <h1 className="text-4xl md:text-6xl font-bold font-serif text-primary mb-6">Material Collection</h1>
                    <p className="text-secondary max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Curated high-performance materials engineered for the world's finest footwear.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Filters Sidebar */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-card border border-theme rounded-xl p-8 sticky top-24 shadow-sm">
                            <div className="flex items-center justify-between font-bold mb-8 text-primary border-b border-theme pb-4">
                                <div className="flex items-center gap-3">
                                    <Filter size={18} className="text-gold" />
                                    <span className="tracking-wide uppercase text-sm">Filters</span>
                                </div>
                                {(selectedMaterials.length > 0 || priceRange < 5000) && (
                                    <button
                                        onClick={() => { setSelectedMaterials([]); setPriceRange(5000); }}
                                        className="text-[10px] text-secondary hover:text-primary flex items-center gap-1 transition-colors uppercase tracking-widest"
                                    >
                                        <X size={12} /> Clear
                                    </button>
                                )}
                            </div>

                            <div className="space-y-10">
                                <div>
                                    <h3 className="font-bold mb-4 text-xs uppercase tracking-widest text-gold">Material Type</h3>
                                    <div className="space-y-3">
                                        {[
                                            'Vamp Lining',
                                            'Quarter Lining',
                                            'Counter Lining',
                                            'Strobel',
                                            'Non-Woven',
                                            'Mesh',
                                            'Microfiber'
                                        ].map((type) => (
                                            <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-all duration-300 ${selectedMaterials.includes(type) ? 'bg-gold border-gold' : 'border-gray-600 group-hover:border-gray-400 bg-transparent'}`}>
                                                    {selectedMaterials.includes(type) && <Check size={12} className="text-black" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedMaterials.includes(type)}
                                                    onChange={() => toggleMaterial(type)}
                                                />
                                                <span className={`text-sm tracking-wide ${selectedMaterials.includes(type) ? 'text-white font-bold' : 'text-gray-400 group-hover:text-gray-200'} transition-colors`}>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold mb-4 text-xs uppercase tracking-widest text-gold">Max Price: ₹{priceRange}</h3>
                                    <input
                                        type="range"
                                        min="100"
                                        max="5000"
                                        step="100"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(Number(e.target.value))}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
                                    />
                                    <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-3">
                                        <span>₹100</span>
                                        <span>₹5000+</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid Area */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-white/5 gap-4">
                            <p className="text-gray-400 text-sm tracking-widest uppercase">
                                Showing <span className="font-bold text-white">{filteredProducts.length}</span> results
                            </p>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 uppercase tracking-wider text-[10px]">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-black border border-white/20 text-gray-200 text-sm focus:ring-1 focus:ring-gold focus:border-gold cursor-pointer py-2 px-4 rounded-none uppercase tracking-wide"
                                >
                                    <option value="newest">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-96 bg-white/5 rounded-none animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-32 bg-white/5 border border-white/10 rounded-sm">
                                <p className="text-gray-400 text-lg mb-4 font-serif italic">No materials found matching your criteria.</p>
                                <button
                                    onClick={() => { setSelectedMaterials([]); setPriceRange(5000); }}
                                    className="text-gold font-bold uppercase tracking-widest text-xs hover:text-white transition-colors border-b border-gold hover:border-white pb-1"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProducts.map((product) => (
                                    <Link key={product._id} to={`/products/${product._id}`} className="group block">
                                        <div className="bg-secondary border border-white/5 overflow-hidden transition-all duration-500 hover:border-gold/50 group-hover:-translate-y-2 relative h-full flex flex-col">

                                            {/* Image container */}
                                            <div className="relative aspect-[4/5] bg-gray-900 overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900 font-mono text-xs uppercase tracking-widest">
                                                        No Preview
                                                    </div>
                                                )}

                                                <div className="absolute top-0 left-0 w-full h-full bg-black/20 group-hover:bg-transparent transition-colors"></div>

                                                {/* Badge */}
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-black/80 backdrop-blur border border-white/10 text-gold text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                                                        {product.materialType}
                                                    </span>
                                                </div>

                                                {/* Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                                    <span className="px-6 py-3 bg-gold text-black font-bold uppercase tracking-widest text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                        View Details
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-6 flex flex-col flex-1 border-t border-white/5 bg-gradient-to-b from-secondary to-black">
                                                <h3 className="font-serif text-xl text-white mb-2 group-hover:text-gold transition-colors line-clamp-1">{product.name}</h3>
                                                <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed h-8">{product.description}</p>

                                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Price per Meter</span>
                                                        <span className="text-lg font-bold text-white font-mono">₹{product.pricePerMeter}</span>
                                                    </div>
                                                    <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                        In Stock
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
