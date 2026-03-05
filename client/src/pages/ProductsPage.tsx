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
    isAvailable: boolean;
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
        let result = products.filter(p => p.isAvailable === true);

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
        <div className="bg-primary min-h-screen text-primary font-sans selection:bg-gold selection:text-black transition-colors duration-300">
            {/* Header */}
            <div className="relative py-28 bg-secondary overflow-hidden transition-colors duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#c29b28]/10 via-transparent to-transparent opacity-0 dark:opacity-40 transition-opacity duration-500"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <span className="text-[#c29b28] text-[10px] font-bold tracking-[0.4em] uppercase mb-5 block animate-fade-in">Excellence in Every Thread</span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tighter">Material <span className="italic font-normal opacity-80">Collection</span></h1>
                    <p className="text-secondary max-w-2xl mx-auto text-lg font-light leading-relaxed animate-fade-in delay-100">
                        Curated high-performance materials engineered for the world's finest footwear brands.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Filters Sidebar */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="glass-card rounded-[1.5rem] p-8 sticky top-24">
                            <div className="flex items-center justify-between font-bold mb-8 text-primary border-b border-theme pb-5">
                                <div className="flex items-center gap-3">
                                    <Filter size={18} className="text-[#c29b28]" />
                                    <span className="tracking-[0.1em] uppercase text-[10px] font-extrabold">Filter Selection</span>
                                </div>
                                {(selectedMaterials.length > 0 || priceRange < 5000) && (
                                    <button
                                        onClick={() => { setSelectedMaterials([]); setPriceRange(5000); }}
                                        className="text-[9px] text-secondary hover:text-[#c29b28] flex items-center gap-1 transition-colors uppercase tracking-[0.15em] font-bold"
                                    >
                                        <X size={10} /> Reset All
                                    </button>
                                )}
                            </div>
 
                            <div className="space-y-12">
                                <div>
                                    <h3 className="font-extrabold mb-5 text-[9px] uppercase tracking-[0.2em] text-[#c29b28]/80">Material Grade</h3>
                                    <div className="space-y-4">
                                        {[
                                            'INTERLININGS',
                                            'COATINGS',
                                            'RAISING',
                                            'DRILL',
                                            'JERSEY',
                                            'CANVAS',
                                            'BONDING',
                                            'FOAM LAMINATIONS'
                                        ].map((type) => (
                                            <label key={type} className="flex items-center gap-4 cursor-pointer group">
                                                <div className={`w-4 h-4 border rounded-none flex items-center justify-center transition-all duration-300 ${selectedMaterials.includes(type) ? 'bg-[#c29b28] border-[#c29b28]' : 'border-slate-500/50 group-hover:border-[#c29b28] bg-transparent'}`}>
                                                    {selectedMaterials.includes(type) && <Check size={10} className="text-black font-black" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedMaterials.includes(type)}
                                                    onChange={() => toggleMaterial(type)}
                                                />
                                                <span className={`text-[11px] tracking-widest uppercase font-medium ${selectedMaterials.includes(type) ? 'text-primary font-black' : 'text-secondary group-hover:text-primary'} transition-colors`}>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
 
                                <div>
                                    <h3 className="font-extrabold mb-5 text-[9px] uppercase tracking-[0.2em] text-[#c29b28]/80">Investment Range: ₹{priceRange}</h3>
                                    <input
                                        type="range"
                                        min="100"
                                        max="5000"
                                        step="100"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(Number(e.target.value))}
                                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#c29b28]"
                                    />
                                    <div className="flex justify-between text-[9px] font-bold tracking-tighter text-slate-500 mt-4">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {filteredProducts.map((product) => (
                                    <Link key={product._id} to={`/products/${product._id}`} className="group block">
                                        <div className="glass-card rounded-[2rem] overflow-hidden transition-all duration-700 hover:border-[#c29b28]/30 group-hover:-translate-y-3 relative h-full flex flex-col border border-white/5">
 
                                            {/* Image container */}
                                            <div className="relative aspect-[4/5] bg-[#020617] overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-700 bg-[#020617] font-bold text-[10px] uppercase tracking-[0.3em]">
                                                        Asset Missing
                                                    </div>
                                                )}
 
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
 
                                                {/* Badge */}
                                                <div className="absolute top-6 left-6">
                                                    <span className="glass px-4 py-1.5 text-[#c29b28] text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                                                        {product.materialType}
                                                    </span>
                                                </div>
 
                                                {/* Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#020617]/40 backdrop-blur-[2px]">
                                                    <span className="px-8 py-3 bg-[#c29b28] text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-full transform translate-y-8 group-hover:translate-y-0 transition-all duration-500">
                                                        Inspect Details
                                                    </span>
                                                </div>
                                            </div>
 
                                            <div className="p-8 flex flex-col flex-1 relative z-10">
                                                <h3 className="font-extrabold text-2xl text-primary mb-3 group-hover:text-[#c29b28] transition-colors line-clamp-1 leading-tight">{product.name}</h3>
                                                <p className="text-secondary text-[11px] mb-6 line-clamp-2 leading-relaxed h-8 font-medium">{product.description}</p>
 
                                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-theme">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-secondary uppercase tracking-[0.2em] font-bold mb-1">Price / M</span>
                                                        <span className="text-xl font-black text-primary tracking-tighter italic">₹{product.pricePerMeter}</span>
                                                    </div>
                                                    <div className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em] flex items-center gap-2 px-3 py-1.5 glass rounded-full">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
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
