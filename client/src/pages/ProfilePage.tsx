import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Shield, MapPin, Lock, Save, Loader } from 'lucide-react';
import type { RootState } from '../store';
import { setCredentials } from '../store/authSlice';

// Reusing AddressBook logic or components would be ideal, but for now we'll inline a simple view or link to it.
import AddressBookPage from './AddressBookPage';

const ProfilePage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Form States
    const [details, setDetails] = useState({
        name: user?.name || '',
        email: user?.email || '',
        companyName: user?.companyName || '',
        gstNumber: user?.gstNumber || '',
        phone: user?.phone || '',
    });

    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false); // Simulated

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        if (activeTab === 'security' && passwordData.password !== passwordData.confirmPassword) {
            setErrorMessage("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const body = activeTab === 'details' ? details : { password: passwordData.password };

            const res = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Update failed');

            dispatch(setCredentials({ ...data, token: user?.token }));
            setSuccessMessage(`${activeTab === 'details' ? 'Profile' : 'Password'} updated successfully.`);
            if (activeTab === 'security') setPasswordData({ password: '', confirmPassword: '' });
        } catch (err: any) {
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-gray-200 font-sans pt-24 pb-12 px-4 selection:bg-gold selection:text-black">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-white mb-8 border-b border-white/10 pb-4">
                    My <span className="text-gold">Account</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                        {[
                            { id: 'details', label: 'Personal Details', icon: User },
                            { id: 'security', label: 'Security & Login', icon: Shield },
                            { id: 'addresses', label: 'Manage Addresses', icon: MapPin },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-white/5 border border-white/10 p-8 relative overflow-hidden">
                        {/* Status Messages */}
                        {successMessage && (
                            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 text-green-400 text-sm font-bold flex items-center gap-2">
                                <CheckCircle size={16} /> {successMessage}
                            </div>
                        )}
                        {errorMessage && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-bold flex items-center gap-2">
                                <Shield size={16} /> {errorMessage}
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <form onSubmit={updateProfile} className="space-y-6 max-w-2xl animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={details.name}
                                            onChange={handleDetailsChange}
                                            className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-gold outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={details.email}
                                            onChange={handleDetailsChange}
                                            className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-gold outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={details.phone}
                                            onChange={handleDetailsChange}
                                            placeholder="+91"
                                            className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-gold outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={details.companyName}
                                            onChange={handleDetailsChange}
                                            placeholder="Optional"
                                            className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-gold outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">GST Details (Optional)</label>
                                        <input
                                            type="text"
                                            name="gstNumber"
                                            value={details.gstNumber}
                                            onChange={handleDetailsChange}
                                            placeholder="GSTIN"
                                            className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-gold outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3 bg-gold text-black font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-10 animate-fade-in">
                                {/* Password Change */}
                                <form onSubmit={updateProfile} className="max-w-xl">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Lock size={20} className="text-gold" /> Change Password
                                    </h3>
                                    <div className="space-y-4">
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="New Password"
                                            value={passwordData.password}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-gold outline-none"
                                        />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm New Password"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-gold outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-6 px-6 py-2 border border-gold text-gold font-bold uppercase tracking-widest hover:bg-gold hover:text-black transition-all text-sm"
                                    >
                                        Update Password
                                    </button>
                                </form>

                                {/* 2-Step Verification (Simulated) */}
                                <div className="pt-10 border-t border-white/10 max-w-xl">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Shield size={20} className="text-gold" /> 2-Step Verification
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-6">
                                        Add an extra layer of security to your account. When enabled, a verification code will be required for login.
                                    </p>
                                    <div className="flex items-center justify-between bg-black/40 p-4 border border-white/10 rounded">
                                        <span className="text-white font-bold text-sm uppercase tracking-wide">
                                            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                        <button
                                            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${twoFactorEnabled ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-green-500/20 text-green-400 hover:bg-green-500/40'
                                                }`}
                                        >
                                            {twoFactorEnabled ? 'Disable' : 'Enable'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="animate-fade-in">
                                <AddressBookPage isEmbedded={true} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Check Icon Component for success message
const CheckCircle = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default ProfilePage;
