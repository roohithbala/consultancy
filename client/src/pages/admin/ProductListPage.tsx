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
    isAvailable: boolean;
}

const ProductListPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const { user } = useSelector((state: RootState) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) { console.error(error); }
    };

    const deleteHandler = async (id: string) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (res.ok) fetchProducts();
            else alert('Failed to delete product');
        } catch (error) { console.error(error); }
    };

    const toggleAvailability = async (id: string, current: boolean) => {
        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
                body: JSON.stringify({ isAvailable: !current }),
            });
            if (res.ok) setProducts(products.map(p => p._id === id ? { ...p, isAvailable: !current } : p));
        } catch (error) { console.error(error); }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-theme">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-primary-text tracking-wide">
                        Product <span className="italic font-normal text-brand">Management</span>
                    </h1>
                    <p className="text-secondary-text mt-2 text-xs tracking-widest uppercase">Inventory &amp; Catalog</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-secondary border border-theme rounded-lg pl-9 pr-4 py-2.5 text-sm text-primary-text focus:outline-none focus:border-brand transition-colors w-60 shadow-sm placeholder:text-secondary-text"
                        />
                    </div>
                    <Link to="/admin/products/add" className="px-5 py-2.5 bg-brand text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap">
                        <Plus size={14} /> Add Product
                    </Link>
                </div>
            </header>

            <div className="bg-secondary border border-theme rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-bg-alt text-secondary-text text-[10px] uppercase font-bold tracking-widest border-b border-theme">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Material Type</th>
                                <th className="px-6 py-4">Price / Meter</th>
                                <th className="px-6 py-4 text-center">Stock</th>
                                <th className="px-6 py-4 text-center">Availability</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme text-sm">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-bg-alt transition-colors group">
                                    <td className="px-6 py-4 font-serif text-primary-text font-medium">{product.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-bg-alt text-secondary-text border border-theme px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                            {product.materialType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary-text font-mono">₹{product.pricePerMeter}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${product.inStock > 0 ? 'bg-brand' : 'bg-red-500'}`} />
                                            <span className="text-primary-text font-mono">{product.inStock}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleAvailability(product._id, product.isAvailable)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                                product.isAvailable
                                                    ? 'bg-brand/10 text-brand border-brand/30 hover:bg-brand/20'
                                                    : 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20'
                                            }`}
                                        >
                                            {product.isAvailable ? 'Available' : 'Unavailable'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <Link to={`/admin/products/${product._id}/edit`} className="text-secondary-text hover:text-primary-text p-2 hover:bg-bg-alt rounded transition-colors">
                                                <Edit size={15} />
                                            </Link>
                                            <button onClick={() => deleteHandler(product._id)} className="text-secondary-text hover:text-red-600 p-2 hover:bg-red-500/10 rounded transition-colors">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-20 text-secondary-text italic text-sm">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-5 flex justify-between items-center text-xs text-secondary-text font-medium">
                <p>Showing {filteredProducts.length} of {products.length} products</p>
                <div className="flex gap-2">
                    <button className="px-4 py-1.5 border border-theme rounded-lg hover:bg-secondary disabled:opacity-40 transition-all" disabled>Previous</button>
                    <button className="px-4 py-1.5 border border-theme rounded-lg hover:bg-secondary disabled:opacity-40 transition-all" disabled>Next</button>
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;
