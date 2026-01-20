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
        <div className={isEmbedded ? "py-4 font-sans text-gray-200" : "min-h-screen bg-black text-gray-200 font-sans pt-24 pb-12 px-6 selection:bg-gold selection:text-black"}>
            {!isEmbedded && (
                <div className="max-w-6xl mx-auto mb-12 border-b border-white/10 pb-6">
                    <span className="text-gold uppercase tracking-[0.2em] text-xs font-bold">Logistics</span>
                    <h1 className="text-4xl font-serif font-bold text-white mt-2">Address Book</h1>
                </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ${!isEmbedded ? 'max-w-6xl mx-auto' : ''}`}>
                {addresses.map((addr) => (
                    <div key={addr._id} className="group border border-white/10 bg-white/5 p-8 relative hover:border-gold/50 transition-all duration-300">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDeleteAddress(addr._id!)} className="text-gray-500 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gold/10 flex items-center justify-center text-gold">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <span className="block font-bold text-lg text-white font-serif">{addr.addressType}</span>
                                {addr.isDefault && <span className="text-[10px] text-green-400 uppercase tracking-widest flex items-center gap-1"><Check size={10} /> Default</span>}
                            </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-400 font-light leading-relaxed">
                            <p className="text-white font-medium">{addr.street}</p>
                            <p>{addr.city}, {addr.postalCode}</p>
                            <p className="uppercase tracking-wider text-xs pt-2 text-gray-500">{addr.country}</p>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => setShowAddForm(true)}
                    className="border border-dashed border-white/20 bg-transparent flex flex-col items-center justify-center p-8 text-gray-500 hover:border-gold hover:text-gold hover:bg-gold/5 transition-all min-h-[200px] group"
                >
                    <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center mb-4 group-hover:border-gold transition-colors">
                        <Plus size={24} />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-xs">Add New Location</span>
                </button>
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-white/10 p-10 max-w-md w-full shadow-2xl relative">
                        <h2 className="text-2xl font-bold mb-8 text-white font-serif border-b border-white/10 pb-4">New Destination</h2>
                        <form onSubmit={handleAddAddress} className="space-y-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Address Label</label>
                                <select
                                    className="w-full bg-black border border-white/20 px-4 py-3 text-white focus:border-gold outline-none appearance-none cursor-pointer"
                                    value={newAddress.addressType}
                                    onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                                >
                                    <option>Home</option>
                                    <option>Work</option>
                                    <option>Warehouse</option>
                                    <option>Factory</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Street Address</label>
                                <input
                                    className="w-full bg-black border border-white/20 px-4 py-3 text-white focus:border-gold outline-none placeholder:text-gray-700"
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    required
                                    placeholder="e.g. 123 Industrial Estate"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">City</label>
                                    <input
                                        className="w-full bg-black border border-white/20 px-4 py-3 text-white focus:border-gold outline-none"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Postal Code</label>
                                    <input
                                        className="w-full bg-black border border-white/20 px-4 py-3 text-white focus:border-gold outline-none"
                                        value={newAddress.postalCode}
                                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 border border-white/20 text-white py-4 font-bold uppercase tracking-widest hover:bg-white/5 transition-colors text-xs">Cancel</button>
                                <button type="submit" className="flex-1 bg-gold text-black py-4 font-bold uppercase tracking-widest hover:bg-white transition-colors text-xs">Save Location</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressBookPage;
