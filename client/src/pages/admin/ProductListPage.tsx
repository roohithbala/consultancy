import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
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

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Products</h1>
                <Link to="/admin/products/add" className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
                    <Plus size={18} /> Add Product
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Material</th>
                            <th className="px-6 py-4">Price / Meter</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{product.name}</td>
                                <td className="px-6 py-4">{product.materialType}</td>
                                <td className="px-6 py-4">₹{product.pricePerMeter}</td>
                                <td className="px-6 py-4">{product.inStock}</td>
                                <td className="px-6 py-4 flex gap-3">
                                    <Link to={`/admin/products/${product._id}/edit`} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></Link>
                                    <button onClick={() => deleteHandler(product._id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">No products found. Start adding some!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductListPage;
