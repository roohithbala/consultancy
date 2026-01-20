import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface Product {
    _id: string;
    name: string;
    materialType: string;
    pricePerMeter: number;
    inStock: number;
}

const ProductListPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const { user } = useSelector((state: RootState) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    const deleteHandler = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });

                if (res.ok) {
                    fetchProducts();
                } else {
                    alert('Failed to delete product');
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-white tracking-wide">
                        Product <span className="text-gold">Management</span>
                    </h1>
                    <p className="text-gray-400 mt-2 text-xs tracking-widest uppercase">Inventory & Catalog</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-gold transition-colors w-64"
                        />
                    </div>
                    <Link to="/admin/products/add" className="px-5 py-2.5 bg-gold text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                        <Plus size={14} /> Add Product
                    </Link>
                </div>
            </header>

            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Material Type</th>
                                <th className="px-6 py-4">Price / Meter</th>
                                <th className="px-6 py-4 text-center">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-serif text-white font-medium">{product.name}</td>
                                    <td className="px-6 py-4 text-gray-400">
                                        <span className="bg-white/10 text-gray-300 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                            {product.materialType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gold font-mono">₹{product.pricePerMeter}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${product.inStock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                            <span className="text-gray-300 font-mono">{product.inStock}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <Link to={`/admin/products/${product._id}/edit`} className="text-blue-400 hover:text-white transition-colors p-2 hover:bg-blue-400/20 rounded">
                                                <Edit size={16} />
                                            </Link>
                                            <button onClick={() => deleteHandler(product._id)} className="text-red-400 hover:text-white transition-colors p-2 hover:bg-red-500/20 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-gray-500 italic">
                                        No products found. Match your search or add a new one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 flex justify-between items-center text-xs text-gray-500">
                <p>Showing {filteredProducts.length} items</p>
                <div className="flex gap-2">
                    {/* Pagination placeholers */}
                    <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/10 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/10 disabled:opacity-50" disabled>Next</button>
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;
