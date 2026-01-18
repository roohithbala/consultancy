import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter } from 'lucide-react';

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
        // 'newest' uses default order (assuming DB returns newest first or we add created_at later)

        setFilteredProducts(result);
    }, [products, selectedMaterials, priceRange, sortBy]);

    const toggleMaterial = (type: string) => {
        setSelectedMaterials(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-gray-100 py-12 text-center border-b border-gray-200">
                <h1 className="text-4xl font-bold mb-4">Materials</h1>
                <p className="text-gray-600 max-w-2xl mx-auto px-4">
                    Explore our specialized range of high-performance materials for footwear manufacturing.
                </p>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="border border-gray-200 rounded-lg p-6 sticky top-24 bg-white shadow-sm">
                            <div className="flex items-center justify-between font-bold mb-6 text-lg border-b pb-4">
                                <div className="flex items-center gap-2">
                                    <Filter size={20} /> Filters
                                </div>
                                {(selectedMaterials.length > 0 || priceRange < 5000) && (
                                    <button
                                        onClick={() => { setSelectedMaterials([]); setPriceRange(5000); }}
                                        className="text-xs text-red-500 hover:underline font-normal"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">Material Type</h3>
                                    <div className="space-y-2">
                                        {[
                                            'Vamp Lining',
                                            'Quarter Lining',
                                            'Counter Lining',
                                            'Strobel',
                                            'Non-Woven',
                                            'Mesh',
                                            'Microfiber'
                                        ].map((type) => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedMaterials.includes(type) ? 'bg-black border-black' : 'border-gray-300 group-hover:border-black'}`}>
                                                    {selectedMaterials.includes(type) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden" // Hiding default checkbox for custom style
                                                    checked={selectedMaterials.includes(type)}
                                                    onChange={() => toggleMaterial(type)}
                                                />
                                                <span className={`text-sm ${selectedMaterials.includes(type) ? 'font-bold text-black' : 'text-gray-600 group-hover:text-black'} transition-colors`}>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">Max Price: ₹{priceRange}</h3>
                                    <input
                                        type="range"
                                        min="100"
                                        max="5000"
                                        step="100"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2">
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
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-100 gap-4">
                            <p className="text-gray-500 text-sm">
                                Showing <span className="font-bold text-black">{filteredProducts.length}</span> results
                            </p>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border-none bg-gray-50 text-sm font-semibold focus:ring-0 cursor-pointer p-2 rounded hover:bg-gray-100 transition-colors"
                                >
                                    <option value="newest">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-80 bg-gray-100 rounded-lg"></div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 text-lg mb-2">No products match your filters.</p>
                                <button
                                    onClick={() => { setSelectedMaterials([]); setPriceRange(5000); }}
                                    className="text-accent font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <Link key={product._id} to={`/products/${product._id}`} className="group block">
                                        <div className="border border-gray-100 rounded-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 bg-white h-full flex flex-col relative">

                                            {/* Image container */}
                                            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                                        No Image
                                                    </div>
                                                )}

                                                {/* Badge */}
                                                <div className="absolute top-3 left-3">
                                                    <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm">
                                                        {product.materialType}
                                                    </span>
                                                </div>

                                                {/* Quick Action Overlay (Amazon-like) */}
                                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                                    <button className="bg-white text-black font-bold py-2 px-6 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform text-sm hover:bg-black hover:text-white">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4 flex flex-col flex-1">
                                                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-accent transition-colors line-clamp-1">{product.name}</h3>
                                                <p className="text-gray-500 text-xs mb-3 line-clamp-2 min-h-[2.5em]">{product.description}</p>

                                                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-xs text-gray-400 block mb-0.5">Price</span>
                                                        <span className="text-lg font-bold text-gray-900">₹{product.pricePerMeter}</span>
                                                    </div>
                                                    <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
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
