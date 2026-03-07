import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Trash2, MapPin, Plus, Check } from 'lucide-react';

interface Address {
    _id?: string;
    addressType: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

const AddressBookPage = ({ isEmbedded = false }: { isEmbedded?: boolean }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddress, setNewAddress] = useState<Address>({
        addressType: 'Home',
        street: '',
        city: '',
        postalCode: '',
        country: 'India',
        isDefault: false
    });

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            const data = await res.json();
            setAddresses(data.addresses || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/users/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify(newAddress)
            });
            if (res.ok) {
                fetchAddresses();
                setShowAddForm(false);
                setNewAddress({
                    addressType: 'Home',
                    street: '',
                    city: '',
                    postalCode: '',
                    country: 'India',
                    isDefault: false
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (window.confirm('Delete this address?')) {
            try {
                const res = await fetch(`http://localhost:5000/api/users/address/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                if (res.ok) fetchAddresses();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className={isEmbedded ? "py-4 font-sans text-primary-text" : "min-h-screen bg-bg-main text-primary-text font-sans pt-24 pb-12 px-6 transition-colors duration-300"}>
            {!isEmbedded && (
                <div className="max-w-6xl mx-auto mb-12 border-b border-theme pb-6">
                    <span className="text-brand uppercase tracking-[0.3em] text-[10px] font-black">Logistics</span>
                    <h1 className="text-4xl font-serif font-bold text-primary-text mt-2">Address Book</h1>
                </div>
            )}

            {showAddForm ? (
                <div className="animate-fade-in max-w-2xl">
                    <h3 className="text-xl font-bold text-primary-text mb-8 flex items-center gap-3">
                        <MapPin size={22} className="text-brand" strokeWidth={2.5} /> New Destination
                    </h3>
                    <form onSubmit={handleAddAddress} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-primary-text/80 mb-3">Address Label</label>
                                <div className="relative group/select">
                                    <select
                                        className="w-full bg-bg-main border border-theme rounded-2xl px-6 py-4 text-primary-text focus:border-brand outline-none appearance-none cursor-pointer shadow-sm font-bold text-sm transition-all group-hover/select:border-brand/40"
                                        value={newAddress.addressType}
                                        onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                                    >
                                        <option>Home</option>
                                        <option>Work</option>
                                        <option>Warehouse</option>
                                        <option>Factory</option>
                                        <option>Other</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-brand">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary-text/80 mb-3">Postal Code</label>
                                <input
                                    className="w-full bg-bg-main border border-theme rounded-2xl px-6 py-4 text-primary-text focus:border-brand outline-none shadow-sm font-bold text-sm"
                                    value={newAddress.postalCode}
                                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                    required
                                    placeholder="e.g. 638052"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary-text/80 mb-3">Street Address</label>
                                <input
                                    className="w-full bg-bg-main border border-theme rounded-2xl px-6 py-4 text-primary-text focus:border-brand outline-none placeholder:text-secondary-text/20 shadow-sm font-bold text-sm"
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    required
                                    placeholder="e.g. 123 Industrial Estate"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary-text/80 mb-3">City</label>
                                <input
                                    className="w-full bg-bg-main border border-theme rounded-2xl px-6 py-4 text-primary-text focus:border-brand outline-none shadow-sm font-bold text-sm"
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                    required
                                    placeholder="e.g. Erode"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary-text/80 mb-3">Country</label>
                                <input
                                    className="w-full bg-bg-main border border-theme rounded-2xl px-6 py-4 text-primary-text focus:border-brand outline-none shadow-sm font-bold text-sm"
                                    value={newAddress.country}
                                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-8 border-t border-theme">
                            <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)} 
                                className="px-10 py-4 border-2 border-theme text-secondary-text/60 rounded-full font-black uppercase tracking-[0.1em] hover:bg-secondary hover:text-primary-text transition-all text-[10px]"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-10 py-4 bg-brand text-black rounded-full font-black uppercase tracking-[0.1em] shadow-lg shadow-brand/20 hover:scale-[1.05] active:scale-[0.98] transition-all text-[10px] flex items-center justify-center gap-2"
                            >
                                <Check size={16} strokeWidth={3} /> Save Location
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ${!isEmbedded ? 'max-w-6xl mx-auto' : ''}`}>
                    {addresses.map((addr) => (
                        <div key={addr._id} className="group border border-theme bg-secondary p-10 rounded-[2.5rem] relative hover:border-brand/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-2 min-h-[280px] flex flex-col justify-between">
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDeleteAddress(addr._id!)} className="text-secondary-text/40 hover:text-red-500 transition-colors p-2">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shadow-inner">
                                    <MapPin size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <span className="block font-black text-lg text-primary-text uppercase tracking-wider">{addr.addressType}</span>
                                    {addr.isDefault && <span className="text-[10px] text-brand uppercase tracking-[0.2em] font-black flex items-center gap-1 mt-1"><Check size={12} strokeWidth={3} /> Default</span>}
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-secondary-text font-medium leading-relaxed">
                                <p className="text-primary-text font-bold text-base">{addr.street}</p>
                                <p className="opacity-70">{addr.city}, {addr.postalCode}</p>
                                <p className="uppercase tracking-[0.2em] text-[10px] font-black pt-4 text-brand/60">{addr.country}</p>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setShowAddForm(true)}
                        className="border-2 border-dashed border-theme bg-white/50 dark:bg-black/5 flex flex-col items-center justify-center p-10 rounded-[2.5rem] text-secondary-text hover:border-brand hover:text-brand hover:bg-brand/5 transition-all min-h-[280px] group shadow-sm hover:shadow-lg"
                    >
                        <div className="w-16 h-16 border-2 border-dashed border-theme rounded-2xl flex items-center justify-center mb-6 group-hover:border-brand group-hover:bg-brand/5 transition-all duration-300">
                            <Plus size={32} strokeWidth={1.5} />
                        </div>
                        <span className="font-black uppercase tracking-[0.3em] text-[10px]">Add New Location</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default AddressBookPage;
