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
        samplePrice: 0,
        isAvailable: true
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
                    samplePrice: data.samplePrice || 0,
                    isAvailable: data.isAvailable !== undefined ? data.isAvailable : true
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
        <div className="max-w-5xl mx-auto pb-12">
            <h1 className="text-4xl font-serif font-black mb-10 text-gray-900 dark:text-white tracking-widest uppercase">
                <span className="text-brand italic font-normal">Edit</span> Product
            </h1>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2rem] shadow-2xl border border-gray-200 dark:border-white/10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-brand outline-none transition-all shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Material Type</label>
                        <select name="materialType" value={formData.materialType} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-brand outline-none transition-all shadow-sm appearance-none" required>
                            <option value="" className="text-gray-900">Select Material</option>
                            <option value="Vamp Lining" className="text-gray-900">Vamp Lining</option>
                            <option value="Quarter Lining" className="text-gray-900">Quarter Lining</option>
                            <option value="Counter Lining" className="text-gray-900">Counter Lining</option>
                            <option value="Strobel" className="text-gray-900">Strobel</option>
                            <option value="Non-Woven" className="text-gray-900">Non-Woven</option>
                            <option value="Mesh" className="text-gray-900">Mesh</option>
                            <option value="Microfiber" className="text-gray-900">Microfiber</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-6 bg-gray-50 dark:bg-black/30 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                    <label className="flex items-center cursor-pointer relative group">
                        <input 
                            type="checkbox" 
                            name="isAvailable" 
                            checked={formData.isAvailable} 
                            onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))} 
                            className="sr-only peer" 
                        />
                        <div className="w-14 h-7 bg-gray-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand shadow-inner"></div>
                        <span className="ml-4 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest group-hover:text-brand transition-colors">Catalog Availability</span>
                    </label>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-brand outline-none transition-all shadow-sm h-40 resize-none leading-relaxed" required></textarea>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Sample Price (₹) <span className="text-gray-400 dark:text-gray-500 lowercase">(0 for free)</span></label>
                    <input type="number" name="samplePrice" value={formData.samplePrice} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-brand outline-none transition-all shadow-sm font-mono" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Price / Meter (₹)</label>
                        <input type="number" name="pricePerMeter" value={formData.pricePerMeter} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-brand outline-none transition-all shadow-sm font-mono" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Stock (Meters)</label>
                        <input type="number" name="inStock" value={formData.inStock} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-brand outline-none transition-all shadow-sm font-mono" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">GSM</label>
                        <input type="number" name="gsm" value={formData.gsm} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-brand outline-none transition-all shadow-sm font-mono" />
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-10">
                    <h3 className="text-2xl font-serif font-bold mb-8 text-gray-900 dark:text-white">Visual Assets</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {['imageUrl', 'textureUrl', 'normalMapUrl', 'roughnessMapUrl'].map((field, idx) => {
                            const labels = ['Main Product Image', 'Fabric Texture Map (For 3D)', 'Normal Map (Optional)', 'Roughness Map (Optional)'];
                            const isUploaded = !!(formData as any)[field];
                            return (
                                <div key={field} className="bg-gray-50 dark:bg-black/30 p-6 rounded-2xl border border-gray-200 dark:border-white/5">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-4">
                                        {labels[idx]}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer bg-white dark:bg-slate-800 hover:bg-brand/10 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 px-5 py-3 rounded-xl flex items-center gap-3 transition-all text-sm font-bold text-gray-900 dark:text-white shadow-sm hover:text-brand flex-grow justify-center">
                                            <Upload size={18} /> {isUploaded ? 'Replace File' : 'Upload'}
                                            <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, field)} />
                                        </label>
                                    </div>
                                    {isUploaded && <p className="text-xs text-brand mt-3 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand"></span> Asset Loaded</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-10">
                    <h3 className="text-2xl font-serif font-bold mb-8 text-gray-900 dark:text-white">Certifications & Documents</h3>

                    <div className="space-y-6">
                        {documents.map((doc, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/5 items-start md:items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Document Name</label>
                                    <input
                                        type="text"
                                        value={doc.name}
                                        onChange={(e) => handleDocumentNameChange(index, e.target.value)}
                                        placeholder="e.g. ISO Certificate"
                                        className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-brand outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">File (PDF/Image)</label>
                                    <label className="cursor-pointer bg-white dark:bg-slate-800 hover:bg-brand/10 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 px-5 py-4 rounded-xl flex items-center gap-3 transition-all text-sm font-bold text-gray-900 dark:text-white shadow-sm hover:text-brand justify-center w-full">
                                        <Upload size={18} /> {doc.url ? 'Change File' : 'Upload Document'}
                                        <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, 'doc', index)} />
                                    </label>
                                    {doc.url && <p className="text-xs text-brand mt-3 font-medium truncate flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand"></span> ...{doc.url.slice(-20)}</p>}
                                </div>
                                <button type="button" onClick={() => removeDocumentRow(index)} className="px-5 py-4 bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold uppercase tracking-widest text-xs rounded-xl transition-all h-[54px]">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={addDocumentRow} className="mt-6 px-6 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white hover:text-brand dark:hover:text-brand hover:border-brand uppercase tracking-widest rounded-xl transition-all border-dashed shadow-sm">
                        + Add Document
                    </button>
                </div>

                <div className="flex justify-end pt-10 mt-6 border-t border-gray-200 dark:border-white/10">
                    <button type="submit" disabled={uploading} className="bg-brand text-white dark:text-black px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl hover:shadow-brand/20 active:scale-95 text-sm">
                        {uploading ? 'Updating Assets...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProductPage;
