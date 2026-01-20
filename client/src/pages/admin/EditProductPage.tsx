import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Upload } from 'lucide-react';

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        materialType: '',
        pricePerMeter: 0,
        width: '',
        gsm: 0,
        inStock: 0,
        imageUrl: '',
        textureUrl: '',
        normalMapUrl: '',
        roughnessMapUrl: '',
        samplePrice: 0
    });

    const [documents, setDocuments] = useState<{ name: string, url: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`);
                const data = await res.json();

                setFormData({
                    name: data.name,
                    description: data.description,
                    materialType: data.materialType,
                    pricePerMeter: data.pricePerMeter,
                    width: data.width,
                    gsm: data.gsm,
                    inStock: data.inStock,
                    imageUrl: data.imageUrl,
                    textureUrl: data.textureMaps?.map || '',
                    normalMapUrl: data.textureMaps?.normalMap || '',
                    roughnessMapUrl: data.textureMaps?.roughnessMap || '',
                    samplePrice: data.samplePrice || 0
                });

                if (data.documents) {
                    setDocuments(data.documents);
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(true);

        try {
            const res = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
                body: uploadData,
            });

            const data = await res.text();
            const fullUrl = `http://localhost:5000${data}`;

            if (index !== undefined) {
                const newDocs = [...documents];
                newDocs[index].url = fullUrl;
                setDocuments(newDocs);
            } else {
                setFormData(prev => ({ ...prev, [field]: fullUrl }));
            }
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    const addDocumentRow = () => {
        setDocuments([...documents, { name: '', url: '' }]);
    };

    const removeDocumentRow = (index: number) => {
        const newDocs = [...documents];
        newDocs.splice(index, 1);
        setDocuments(newDocs);
    };

    const handleDocumentNameChange = (index: number, value: string) => {
        const newDocs = [...documents];
        newDocs[index].name = value;
        setDocuments(newDocs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const productData = {
            ...formData,
            documents,
            textureMaps: {
                map: formData.textureUrl,
                normalMap: formData.normalMapUrl,
                roughnessMap: formData.roughnessMapUrl
            }
        };

        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify(productData),
            });

            if (res.ok) {
                navigate('/admin/products');
            } else {
                alert('Failed to update product');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 font-serif text-primary">Edit Product</h1>

            <form onSubmit={handleSubmit} className="bg-card p-8 rounded-xl shadow-lg border border-theme space-y-6 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary/10 border border-theme rounded-lg text-primary focus:outline-none focus:border-gold transition-colors" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Material Type</label>
                        <select name="materialType" value={formData.materialType} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary/10 border border-theme rounded-lg text-primary focus:outline-none focus:border-gold transition-colors appearance-none" required>
                            <option value="">Select Material</option>
                            <option value="Vamp Lining">Vamp Lining</option>
                            <option value="Quarter Lining">Quarter Lining</option>
                            <option value="Counter Lining">Counter Lining</option>
                            <option value="Strobel">Strobel</option>
                            <option value="Non-Woven">Non-Woven</option>
                            <option value="Mesh">Mesh</option>
                            <option value="Microfiber">Microfiber</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary/10 border border-theme rounded-lg h-32 text-primary focus:outline-none focus:border-gold transition-colors" required></textarea>
                </div>

                <div>
                    <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Sample Price (₹) <span className="text-secondary/50 font-normal text-xs normal-case">(0 for free)</span></label>
                    <input type="number" name="samplePrice" value={formData.samplePrice} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary/10 border border-theme rounded-lg text-primary focus:outline-none focus:border-gold transition-colors" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Price / Meter (₹)</label>
                        <input type="number" name="pricePerMeter" value={formData.pricePerMeter} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary/10 border border-theme rounded-lg text-primary focus:outline-none focus:border-gold transition-colors" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Stock (Meters)</label>
                        <input type="number" name="inStock" value={formData.inStock} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary/10 border border-theme rounded-lg text-primary focus:outline-none focus:border-gold transition-colors" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">GSM</label>
                        <input type="number" name="gsm" value={formData.gsm} onChange={handleInputChange} className="w-full px-4 py-3 bg-secondary/10 border border-theme rounded-lg text-primary focus:outline-none focus:border-gold transition-colors" />
                    </div>
                </div>

                <div className="border-t border-theme pt-6">
                    <h3 className="text-lg font-bold mb-4 font-serif text-primary">Visual Assets</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Main Product Image</label>
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer bg-secondary/20 hover:bg-secondary/30 text-primary px-4 py-2 rounded-lg flex items-center gap-2 border border-theme transition-colors">
                                    <Upload size={16} /> Upload
                                    <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, 'imageUrl')} />
                                </label>
                                {formData.imageUrl && <span className="text-xs text-green-500 font-bold truncate max-w-[200px]">Uploaded</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Fabric Texture Map (For 3D)</label>
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer bg-secondary/20 hover:bg-secondary/30 text-primary px-4 py-2 rounded-lg flex items-center gap-2 border border-theme transition-colors">
                                    <Upload size={16} /> Upload
                                    <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, 'textureUrl')} />
                                </label>
                                {formData.textureUrl && <span className="text-xs text-green-500 font-bold truncate max-w-[200px]">Uploaded</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Normal Map (Optional)</label>
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer bg-secondary/20 hover:bg-secondary/30 text-primary px-4 py-2 rounded-lg flex items-center gap-2 border border-theme transition-colors">
                                    <Upload size={16} /> Upload
                                    <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, 'normalMapUrl')} />
                                </label>
                                {formData.normalMapUrl && <span className="text-xs text-green-500 font-bold truncate max-w-[200px]">Uploaded</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">Roughness Map (Optional)</label>
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer bg-secondary/20 hover:bg-secondary/30 text-primary px-4 py-2 rounded-lg flex items-center gap-2 border border-theme transition-colors">
                                    <Upload size={16} /> Upload
                                    <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, 'roughnessMapUrl')} />
                                </label>
                                {formData.roughnessMapUrl && <span className="text-xs text-green-500 font-bold truncate max-w-[200px]">Uploaded</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-theme pt-6">
                    <h3 className="text-lg font-bold mb-4 font-serif text-primary">Certifications & Documents</h3>

                    <div className="space-y-4">
                        {documents.map((doc, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-end border border-theme p-4 rounded-lg bg-secondary/5">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-1">Document Name</label>
                                    <input
                                        type="text"
                                        value={doc.name}
                                        onChange={(e) => handleDocumentNameChange(index, e.target.value)}
                                        placeholder="e.g. ISO Certificate"
                                        className="w-full px-4 py-3 bg-secondary/10 border border-theme rounded-lg text-primary focus:outline-none focus:border-gold transition-colors"
                                    />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-1">File (PDF/Image)</label>
                                    <div className="flex items-center gap-2">
                                        <label className="cursor-pointer bg-secondary/20 hover:bg-secondary/30 text-primary border border-theme px-4 py-3 rounded-lg flex items-center gap-2 flex-grow justify-center transition-colors">
                                            <Upload size={16} /> {doc.url ? 'Change File' : 'Upload File'}
                                            <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, 'doc', index)} />
                                        </label>
                                    </div>
                                    {doc.url && <p className="text-xs text-green-500 mt-1 truncate">Uploaded: ...{doc.url.slice(-20)}</p>}
                                </div>
                                <button type="button" onClick={() => removeDocumentRow(index)} className="text-red-500 hover:text-red-600 font-bold px-4 py-2 uppercase text-xs tracking-wider">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={addDocumentRow} className="mt-4 text-sm font-bold text-accent hover:underline">
                        + Add Document
                    </button>
                </div>

                <div className="flex justify-end pt-6 border-t border-theme">
                    <button type="submit" disabled={uploading} className="bg-gold text-black px-8 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 shadow-lg">
                        {uploading ? 'Updating Assets...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProductPage;
