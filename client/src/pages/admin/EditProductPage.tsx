import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Upload } from 'lucide-react';
import { API } from '../../config/api';

// Common field classes using CSS variable theme tokens
const fieldCls = "w-full px-5 py-4 bg-secondary border border-theme rounded-xl text-primary-text focus:border-brand outline-none transition-all shadow-sm";
const labelCls = "block text-xs font-bold text-secondary-text uppercase tracking-widest mb-3";

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
                const res = await fetch(`${API}/products/${id}`);
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
                if (data.documents) setDocuments(data.documents);
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
            const res = await fetch(`${API}/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${user?.token}` },
                body: uploadData,
            });
            const data = await res.text();
            const fullUrl = `${API.replace('/api', '')}${data}`;
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

    const addDocumentRow = () => setDocuments([...documents, { name: '', url: '' }]);

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
            const res = await fetch(`${API}/products/${id}`, {
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

    if (loading) return (
        <div className="flex items-center justify-center h-48 text-secondary-text">Loading…</div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <h1 className="text-4xl font-serif font-black mb-10 text-primary-text tracking-widest uppercase">
                <span className="text-brand italic font-normal">Edit</span> Product
            </h1>

            <form onSubmit={handleSubmit} className="bg-card border border-theme p-8 md:p-10 rounded-[2rem] shadow-2xl space-y-10">

                {/* Name + Material */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className={labelCls}>Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={fieldCls} required />
                    </div>
                    <div>
                        <label className={labelCls}>Material Type</label>
                        <select name="materialType" value={formData.materialType} onChange={handleInputChange} className={`${fieldCls} appearance-none`} required>
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

                {/* Availability toggle */}
                <div className="flex items-center gap-6 bg-secondary border border-theme p-6 rounded-2xl">
                    <label className="flex items-center cursor-pointer relative group">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-secondary-text/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand shadow-inner"></div>
                        <span className="ml-4 text-sm font-bold text-primary-text uppercase tracking-widest group-hover:text-brand transition-colors">Catalog Availability</span>
                    </label>
                </div>

                {/* Description */}
                <div>
                    <label className={labelCls}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className={`${fieldCls} h-40 resize-none leading-relaxed`} required></textarea>
                </div>

                {/* Sample Price */}
                <div>
                    <label className={labelCls}>Sample Price (₹) <span className="text-secondary-text/50 lowercase">(0 for free)</span></label>
                    <input type="number" min="0" step="0.01" name="samplePrice" value={formData.samplePrice} onChange={handleInputChange} className={`${fieldCls} font-mono`} />
                </div>

                {/* Price / Stock / GSM */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className={labelCls}>Price / Meter (₹)</label>
                        <input type="number" min="0" step="0.01" name="pricePerMeter" value={formData.pricePerMeter} onChange={handleInputChange} className={`${fieldCls} font-mono`} required />
                    </div>
                    <div>
                        <label className={labelCls}>Stock (Meters)</label>
                        <input type="number" min="0" step="1" name="inStock" value={formData.inStock} onChange={handleInputChange} className={`${fieldCls} font-mono`} required />
                    </div>
                    <div>
                        <label className={labelCls}>GSM</label>
                        <input type="number" min="0" step="1" name="gsm" value={formData.gsm} onChange={handleInputChange} className={`${fieldCls} font-mono`} />
                    </div>
                </div>

                {/* Visual Assets */}
                <div className="border-t border-theme pt-10">
                    <h3 className="text-2xl font-serif font-bold mb-8 text-primary-text">Visual Assets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {['imageUrl', 'textureUrl', 'normalMapUrl', 'roughnessMapUrl'].map((field, idx) => {
                            const labels = ['Main Product Image', 'Fabric Texture Map (For 3D)', 'Normal Map (Optional)', 'Roughness Map (Optional)'];
                            const isUploaded = !!(formData as any)[field];
                            return (
                                <div key={field} className="bg-secondary border border-theme p-6 rounded-2xl">
                                    <label className={`${labelCls} mb-4`}>{labels[idx]}</label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer bg-card hover:bg-brand/5 border border-theme px-5 py-3 rounded-xl flex items-center gap-3 transition-all text-sm font-bold text-primary-text hover:text-brand hover:border-brand/40 flex-grow justify-center">
                                            <Upload size={18} />
                                            {isUploaded ? 'Replace File' : 'Upload'}
                                            <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, field)} />
                                        </label>
                                    </div>
                                    {isUploaded && <p className="text-xs text-brand mt-3 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand"></span> Asset Loaded</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Documents */}
                <div className="border-t border-theme pt-10">
                    <h3 className="text-2xl font-serif font-bold mb-8 text-primary-text">Certifications &amp; Documents</h3>
                    <div className="space-y-6">
                        {documents.map((doc, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-secondary border border-theme items-start md:items-end">
                                <div className="flex-1 w-full">
                                    <label className={labelCls}>Document Name</label>
                                    <input
                                        type="text"
                                        value={doc.name}
                                        onChange={(e) => handleDocumentNameChange(index, e.target.value)}
                                        placeholder="e.g. ISO Certificate"
                                        className={fieldCls}
                                    />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className={labelCls}>File (PDF/Image)</label>
                                    <label className="cursor-pointer bg-card hover:bg-brand/5 border border-theme px-5 py-4 rounded-xl flex items-center gap-3 transition-all text-sm font-bold text-primary-text hover:text-brand hover:border-brand/40 justify-center w-full">
                                        <Upload size={18} />
                                        {doc.url ? 'Change File' : 'Upload Document'}
                                        <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, 'doc', index)} />
                                    </label>
                                    {doc.url && <p className="text-xs text-brand mt-3 font-medium truncate flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand"></span> …{doc.url.slice(-20)}</p>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeDocumentRow(index)}
                                    className="px-5 py-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold uppercase tracking-widest text-xs rounded-xl transition-all h-[54px] border border-red-500/20"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addDocumentRow}
                        className="mt-6 px-6 py-3 bg-secondary border border-dashed border-theme text-xs font-bold text-primary-text hover:text-brand hover:border-brand uppercase tracking-widest rounded-xl transition-all"
                    >
                        + Add Document
                    </button>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-10 mt-6 border-t border-theme">
                    <button
                        type="submit"
                        disabled={uploading}
                        className="bg-brand text-black px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl hover:shadow-brand/20 active:scale-95 text-sm"
                    >
                        {uploading ? 'Updating Assets…' : 'Update Product'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EditProductPage;
