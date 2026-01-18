import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Trash2, MapPin, Plus } from 'lucide-react';

interface Address {
    _id?: string;
    addressType: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

const AddressBookPage = () => {
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
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Address Book</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {addresses.map((addr) => (
                    <div key={addr._id} className="border p-6 rounded-lg relative hover:shadow-md transition-shadow">
                        <div className="absolute top-4 right-4">
                            <button onClick={() => handleDeleteAddress(addr._id!)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="text-accent" size={20} />
                            <span className="font-bold text-lg">{addr.addressType}</span>
                            {addr.isDefault && <span className="bg-gray-100 text-xs px-2 py-1 rounded">Default</span>}
                        </div>
                        <p className="text-gray-600 mb-1">{addr.street}</p>
                        <p className="text-gray-600 mb-1">{addr.city}, {addr.postalCode}</p>
                        <p className="text-gray-600">{addr.country}</p>
                    </div>
                ))}

                <button
                    onClick={() => setShowAddForm(true)}
                    className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 text-gray-500 hover:border-accent hover:text-accent transition-colors min-h-[200px]"
                >
                    <Plus size={32} className="mb-2" />
                    <span className="font-medium">Add New Address</span>
                </button>
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-xl max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6">Add New Address</h2>
                        <form onSubmit={handleAddAddress} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Address Type</label>
                                <select
                                    className="w-full border rounded-lg px-4 py-2"
                                    value={newAddress.addressType}
                                    onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                                >
                                    <option>Home</option>
                                    <option>Work</option>
                                    <option>Warehouse</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Street Address</label>
                                <input
                                    className="w-full border rounded-lg px-4 py-2"
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">City</label>
                                    <input
                                        className="w-full border rounded-lg px-4 py-2"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                                    <input
                                        className="w-full border rounded-lg px-4 py-2"
                                        value={newAddress.postalCode}
                                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-black text-white py-2 rounded-lg font-bold">Save Address</button>
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 border border-gray-300 py-2 rounded-lg">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressBookPage;
