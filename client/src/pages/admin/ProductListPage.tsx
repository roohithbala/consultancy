import { useEffect, useState } from 'react';
import { API } from '../../config/api';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter, X, Eye } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import type { RootState } from '../../store';

interface Product {
    _id: string;
    name: string;
    description: string;
    materialType: string;
    pricePerMeter: number;
    inStock: number;
    imageUrl: string;
    isAvailable: boolean;
    samplePrice?: number;
}

const ALL_TYPES = ['INTERLININGS','COATINGS','RAISING','DRILL','JERSEY','CANVAS','BONDING','FOAM LAMINATIONS','Non-Woven','Mesh','Microfiber','Strobel'];

const ProductListPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API}/products`);
            setProducts(await res.json());
            setLoading(false);
        } catch (e) { console.error(e); setLoading(false); }
    };

    const deleteHandler = async (id: string) => {
        if (!window.confirm('Delete this product?')) return;
        const res = await fetch(`${API}/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (res.ok) {
            setProducts(p => p.filter(x => x._id !== id));
            toast.success('Product deleted');
        } else {
            toast.error('Failed to delete product');
        }
    };

    const toggleAvailability = async (id: string, current: boolean) => {
        const res = await fetch(`${API}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
            body: JSON.stringify({ isAvailable: !current }),
        });
        if (res.ok) setProducts(p => p.map(x => x._id === id ? { ...x, isAvailable: !current } : x));
    };

    const toggleType = (t: string) =>
        setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = selectedTypes.length === 0 || selectedTypes.includes(p.materialType);
        return matchSearch && matchType;
    });

    return (
        <div className="font-sans pb-12">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-theme">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-primary-text tracking-wide">
                        Product <span className="italic font-normal text-brand">Management</span>
                    </h1>
                    <p className="text-secondary-text mt-1 text-xs tracking-widest uppercase">Inventory &amp; Catalog — {products.length} products</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {/* Search */}
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                        <input
                            type="text"
                            placeholder="Search products…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-secondary border border-theme rounded-xl pl-8 pr-4 py-2.5 text-xs text-primary-text focus:outline-none focus:border-brand transition-colors w-52 placeholder:text-secondary-text"
                        />
                    </div>
                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilter(v => !v)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-bold transition-all ${showFilter ? 'border-brand bg-brand/5 text-brand' : 'border-theme text-secondary-text hover:text-primary-text'}`}
                    >
                        <Filter size={13} /> Filter {selectedTypes.length > 0 && <span className="bg-brand text-black w-4 h-4 rounded-full text-[9px] flex items-center justify-center">{selectedTypes.length}</span>}
                    </button>
                    <Link to="/admin/products/add" className="px-5 py-2.5 bg-brand text-black rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg">
                        <Plus size={14} /> Add Product
                    </Link>
                </div>
            </header>

            {/* Filter panel */}
            {showFilter && (
                <div className="mb-6 p-5 bg-secondary border border-theme rounded-2xl flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary-text mr-1">Category:</span>
                    {ALL_TYPES.map(t => (
                        <button key={t} onClick={() => toggleType(t)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${selectedTypes.includes(t) ? 'bg-brand text-black border-brand' : 'border-theme text-secondary-text hover:border-brand/40 hover:text-primary-text'}`}>
                            {t}
                        </button>
                    ))}
                    {selectedTypes.length > 0 && (
                        <button onClick={() => setSelectedTypes([])} className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase ml-2 hover:opacity-70 transition-opacity">
                            <X size={10} /> Clear
                        </button>
                    )}
                </div>
            )}

            {/* Results count */}
            <p className="text-secondary-text/60 text-xs tracking-widest uppercase font-bold mb-6">
                Showing <span className="font-extrabold text-primary-text">{filtered.length}</span> of {products.length} products
            </p>

            {/* Product Card Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="h-80 bg-secondary/50 rounded-[2rem] animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-32 bg-secondary/20 border border-theme rounded-2xl">
                    <p className="text-secondary-text text-sm italic font-serif mb-3">No products match your search.</p>
                    <button onClick={() => { setSearchTerm(''); setSelectedTypes([]); }} className="text-brand font-bold uppercase tracking-widest text-xs border-b border-brand pb-0.5">Clear filters</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filtered.map(product => (
                        <div key={product._id} className="group relative bg-card border border-theme rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-brand/30 hover:-translate-y-2 flex flex-col shadow-sm hover:shadow-xl hover:shadow-brand/5">

                            {/* Image */}
                            <div className="relative aspect-[4/3] bg-secondary overflow-hidden border-b border-theme">
                                    <img
                                        src={product.imageUrl || 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=1000&auto=format&fit=crop'}
                                        alt={product.name}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=1000&auto=format&fit=crop'; }}
                                    />

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Material type badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-black/40 backdrop-blur-md px-3 py-1 text-brand text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-white/10">
                                        {product.materialType}
                                    </span>
                                </div>

                                {/* Availability badge */}
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={() => toggleAvailability(product._id, product.isAvailable)}
                                        title="Click to toggle availability"
                                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                                            product.isAvailable
                                                ? 'bg-brand/20 text-brand border-brand/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-400/30'
                                                : 'bg-red-500/20 text-red-400 border-red-400/30 hover:bg-brand/20 hover:text-brand hover:border-brand/30'
                                        }`}
                                    >
                                        {product.isAvailable ? '● Live' : '○ Hidden'}
                                    </button>
                                </div>

                                {/* Hover admin actions overlay */}
                                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-[2px]">
                                    <Link
                                        to={`/products/${product._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 bg-white/90 text-gray-900 rounded-xl font-bold hover:bg-brand hover:text-black transition-all shadow-xl text-xs flex items-center gap-1.5 translate-y-3 group-hover:translate-y-0 duration-300"
                                    >
                                        <Eye size={14} /> Preview
                                    </Link>
                                    <Link
                                        to={`/admin/products/${product._id}/edit`}
                                        className="p-2.5 bg-white/90 text-gray-900 rounded-xl font-bold hover:bg-brand hover:text-black transition-all shadow-xl text-xs flex items-center gap-1.5 translate-y-3 group-hover:translate-y-0 duration-300 delay-75"
                                    >
                                        <Edit size={14} /> Edit
                                    </Link>
                                    <button
                                        onClick={() => deleteHandler(product._id)}
                                        className="p-2.5 bg-red-500/90 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-xl text-xs flex items-center gap-1.5 translate-y-3 group-hover:translate-y-0 duration-300 delay-150"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="font-extrabold text-lg text-primary-text mb-1 group-hover:text-brand transition-colors line-clamp-1 leading-tight">
                                    {product.name}
                                </h3>
                                <p className="text-secondary-text text-xs line-clamp-2 leading-relaxed mb-4 flex-1">
                                    {product.description || 'No description available.'}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-theme text-primary-text">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-secondary-text/60 uppercase tracking-[0.2em] font-bold mb-0.5">Per Meter</span>
                                        <span className="text-xl font-black tracking-tighter italic">₹{product.pricePerMeter}</span>
                                    </div>
                                    <div className={`text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${
                                        product.inStock > 0
                                            ? 'text-brand bg-brand/10 border-brand/20'
                                            : 'text-red-500 bg-red-500/10 border-red-500/20'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${product.inStock > 0 ? 'bg-brand animate-pulse' : 'bg-red-500'}`} />
                                        {product.inStock > 0 ? `${product.inStock.toLocaleString()}m` : 'Out of Stock'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductListPage;
