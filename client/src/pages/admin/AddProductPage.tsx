import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Upload } from 'lucide-react';
import { API } from '../../config/api';

const AddProductPage = () => {
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
        coatings: '',
        isAvailable: true
    });

    const [documents, setDocuments] = useState<{ name: string, url: string }[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        // Determine field name for multer based on file type if strictly needed, but middleware checks content
        // Our middleware uses 'image' field for single upload
        uploadData.append('image', file);

        setUploading(true);

        try {
            const res = await fetch(`${API}/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
                body: uploadData,
            });

            const data = await res.text(); // Returns path
            const fullUrl = `${API.replace('/api', '')}${data}`;

            if (index !== undefined) {
                // Updating a document url
                const newDocs = [...documents];
                newDocs[index].url = fullUrl;
                setDocuments(newDocs);
            } else {
                // Updating main form data
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
            coatings: formData.coatings.split(',').map(c => c.trim()).filter(Boolean),
            documents,
            textureMaps: {
                map: formData.textureUrl,
                normalMap: formData.normalMapUrl,
                roughnessMap: formData.roughnessMapUrl
            }
        };

        try {
            const res = await fetch(`${API}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify(productData),
            });

            if (res.ok) {
                navigate('/admin/products');
            } else {
                alert('Failed to create product');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <h1 className="text-4xl font-serif font-black mb-10 text-primary-text tracking-widest uppercase">
                Add New <span className="text-brand italic font-normal">Product</span>
            </h1>

            <form onSubmit={handleSubmit} className="bg-secondary p-8 md:p-10 rounded-[2rem] shadow-2xl border border-theme space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-secondary-text uppercase tracking-widest mb-3">Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-5 py-4 bg-bg-main border border-theme rounded-xl text-primary-text focus:border-brand outline-none transition-all shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-secondary-text uppercase tracking-widest mb-3">Material Type</label>
                        <select name="materialType" value={formData.materialType} onChange={handleInputChange} className="w-full px-5 py-4 bg-bg-main border border-theme rounded-xl text-primary-text focus:border-brand outline-none transition-all shadow-sm" required>
                            <option value="">— Select Material Type —</option>
                            <optgroup label="Core Processes">
                                <option value="COATINGS">COATINGS</option>
                                <option value="INTERLININGS">INTERLININGS</option>
                                <option value="RAISING">RAISING</option>
                                <option value="DRILL">DRILL</option>
                                <option value="JERSEY">JERSEY</option>
                                <option value="CANVAS">CANVAS</option>
                                <option value="BONDING">BONDING</option>
                                <option value="FOAM LAMINATIONS">FOAM LAMINATIONS</option>
                            </optgroup>
                            <optgroup label="Specialist Processes">
                                <option value="Advanced Fusing">Advanced Fusing</option>
                                <option value="Polyester Printing">Polyester Printing</option>
                                <option value="Precision Sizing">Precision Sizing</option>
                                <option value="Premium Weaving">Premium Weaving</option>
                                <option value="Dye &amp; Wash">Dye &amp; Wash</option>
                                <option value="Eva Polymer Coating">Eva Polymer Coating</option>
                                <option value="Dot Coating">Dot Coating</option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-6 bg-bg-main p-6 rounded-2xl border border-theme">
                    <label className="flex items-center cursor-pointer relative group">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-secondary-text/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-200 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand shadow-inner"></div>
                        <span className="ml-4 text-sm font-bold text-primary-text uppercase tracking-widest group-hover:text-brand transition-colors">Catalog Availability</span>
                    </label>
                </div>

                <div>
                    <label className="block text-xs font-bold text-secondary-text uppercase tracking-widest mb-3">Available Coatings <span className="text-secondary-text/60 lowercase">(comma-separated)</span></label>
                    <input type="text" name="coatings" value={formData.coatings} onChange={handleInputChange} placeholder="e.g. TPU, EVA, PU, Hotmelt" className="w-full px-5 py-4 bg-bg-main border border-theme rounded-xl text-primary-text focus:border-brand outline-none transition-all shadow-sm placeholder:text-secondary-text" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-secondary-text uppercase tracking-widest mb-3">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full px-5 py-4 bg-bg-main border border-theme rounded-xl text-primary-text focus:border-brand outline-none transition-all shadow-sm h-40 resize-none leading-relaxed" required></textarea>
                </div>

                <div>
                    <label className="block text-xs font-bold text-secondary-text uppercase tracking-widest mb-3">Sample Price (₹) <span className="text-secondary-text/60 lowercase">(0 for free)</span></label>
                    <input type="number" name="samplePrice" value={formData.samplePrice} onChange={handleInputChange} className="w-full px-5 py-4 bg-bg-main border border-theme rounded-xl text-primary-text focus:border-brand outline-none transition-all shadow-sm font-mono" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-secondary-text uppercase tracking-widest mb-3">Price / Meter (₹)</label>
                        <input type="number" name="pricePerMeter" value={formData.pricePerMeter} onChange={handleInputChange} className="w-full px-5 py-4 bg-bg-main border border-theme rounded-xl text-primary-text focus:border-brand outline-none transition-all shadow-sm font-mono" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-secondary-text uppercase tracking-widest mb-3">Stock (Meters)</label>
                        <input type="number" name="inStock" value={formData.inStock} onChange={handleInputChange} className="w-full px-5 py-4 bg-bg-main border border-theme rounded-xl text-primary-text focus:border-brand outline-none transition-all shadow-sm font-mono" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-secondary-text uppercase tracking-widest mb-3">GSM</label>
                        <input type="number" name="gsm" value={formData.gsm} onChange={handleInputChange} className="w-full px-5 py-4 bg-bg-main border border-theme rounded-xl text-primary-text focus:border-brand outline-none transition-all shadow-sm font-mono" />
                    </div>
                </div>

                <div className="border-t border-theme pt-10">
                    <h3 className="text-2xl font-serif font-bold mb-8 text-primary-text">Visual Assets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {['imageUrl', 'textureUrl', 'normalMapUrl', 'roughnessMapUrl'].map((field, idx) => {
                            const labels = ['Main Product Image', 'Fabric Texture Map (For 3D)', 'Normal Map (Optional)', 'Roughness Map (Optional)'];
                            const isReq = idx < 2;
                            const isUploaded = !!(formData as any)[field];
                            return (
                                <div key={field} className="bg-bg-main p-6 rounded-2xl border border-theme">
                                    <label className="block text-xs font-bold text-secondary-text uppercase tracking-widest mb-4">
                                        {labels[idx]} {isReq && <span className="text-brand">*</span>}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer bg-secondary hover:bg-brand/10 border border-theme px-5 py-3 rounded-xl flex items-center gap-3 transition-all text-sm font-bold text-primary-text shadow-sm hover:text-brand flex-grow justify-center">
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

                <div className="border-t border-theme pt-10">
                    <h3 className="text-2xl font-serif font-bold mb-8 text-primary-text">Certifications &amp; Documents</h3>
                    <div className="space-y-6">
                        {documents.map((doc, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-bg-main border border-theme items-start md:items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-secondary-text uppercase tracking-widest mb-3">Document Name</label>
                                    <input
                                        type="text"
                                        value={doc.name}
                                        onChange={(e) => handleDocumentNameChange(index, e.target.value)}
                                        placeholder="e.g. ISO Certificate"
                                        className="w-full px-5 py-4 bg-secondary border border-theme rounded-xl text-primary-text focus:border-brand outline-none transition-all shadow-sm placeholder:text-secondary-text"
                                    />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-secondary-text uppercase tracking-widest mb-3">File (PDF/Image)</label>
                                    <label className="cursor-pointer bg-secondary hover:bg-brand/10 border border-theme px-5 py-4 rounded-xl flex items-center gap-3 transition-all text-sm font-bold text-primary-text shadow-sm hover:text-brand justify-center w-full">
                                        <Upload size={18} /> {doc.url ? 'Change File' : 'Upload Document'}
                                        <input type="file" className="hidden" onChange={(e) => uploadFileHandler(e, 'doc', index)} />
                                    </label>
                                    {doc.url && <p className="text-xs text-brand mt-3 font-medium truncate flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand"></span> ...{doc.url.slice(-20)}</p>}
                                </div>
                                <button type="button" onClick={() => removeDocumentRow(index)} className="px-5 py-4 bg-red-500/10 text-red-600 hover:bg-red-500/20 font-bold uppercase tracking-widest text-xs rounded-xl transition-all h-[54px]">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addDocumentRow} className="mt-6 px-6 py-3 bg-bg-main border border-theme border-dashed text-xs font-bold text-secondary-text hover:text-brand hover:border-brand uppercase tracking-widest rounded-xl transition-all shadow-sm">
                        + Add Document
                    </button>
                </div>

                <div className="flex justify-end pt-10 mt-6 border-t border-theme">
                    <button type="submit" disabled={uploading} className="bg-brand text-black px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl hover:shadow-brand/20 active:scale-95 text-sm">
                        {uploading ? 'Uploading Assets...' : 'Initialize Product Lifecycle'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProductPage;
