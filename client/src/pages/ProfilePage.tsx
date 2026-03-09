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
        gstNo: user?.gstNo || '',
        phone: user?.phone || '',
    });

    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.is2SVEnabled || false);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    useEffect(() => {
        setTwoFactorEnabled(user?.is2SVEnabled || false);
    }, [user?.is2SVEnabled]);

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const toggle2SV = async () => {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const res = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify({ is2SVEnabled: !twoFactorEnabled })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to toggle 2SV');

            setTwoFactorEnabled(data.is2SVEnabled);
            dispatch(setCredentials({ ...data, token: user?.token }));
            setSuccessMessage(`2-Step Verification ${data.is2SVEnabled ? 'enabled' : 'disabled'} successfully.`);
        } catch (err: any) {
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
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
        <div className="min-h-screen bg-bg-main text-primary-text font-sans pt-24 pb-12 px-4 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-primary-text mb-8 border-b border-theme pb-4">
                    My <span className="text-brand">Account</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
                        {[
                            { id: 'details', label: 'Personal Details', icon: User },
                            { id: 'security', label: 'Security & Login', icon: Shield },
                            { id: 'addresses', label: 'Manage Addresses', icon: MapPin },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-2xl border
                                    ${activeTab === tab.id
                                        ? 'bg-brand text-black border-brand shadow-lg shadow-brand/20 scale-[1.02]'
                                        : 'bg-secondary text-secondary-text/60 border-theme hover:border-brand/30 hover:text-primary-text'
                                    }`}
                            >
                                <tab.icon size={18} strokeWidth={2.5} /> <span className="truncate">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-secondary rounded-[2rem] border border-theme p-6 md:p-10 relative shadow-sm flex flex-col transition-all duration-500">
                        {/* Status Messages */}
                        {successMessage && (
                            <div className="mb-8 p-5 bg-brand/10 border border-brand/20 text-brand text-[11px] font-black uppercase tracking-widest flex items-center gap-3 rounded-2xl">
                                <CheckCircle size={18} /> {successMessage}
                            </div>
                        )}
                        {errorMessage && (
                            <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 rounded-2xl">
                                <Shield size={18} /> {errorMessage}
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <form onSubmit={updateProfile} className="space-y-8 max-w-2xl animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary-text/80 mb-3">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={details.name}
                                            onChange={handleDetailsChange}
                                            className="w-full bg-bg-main border border-theme rounded-xl p-4 text-primary-text focus:border-brand outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary-text/80 mb-3">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={details.email}
                                            onChange={handleDetailsChange}
                                            className="w-full bg-bg-main border border-theme rounded-xl p-4 text-primary-text focus:border-brand outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary-text/80 mb-3">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={details.phone}
                                            onChange={handleDetailsChange}
                                            placeholder="+91"
                                            className="w-full bg-bg-main border border-theme rounded-xl p-4 text-primary-text focus:border-brand outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary-text/80 mb-3">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={details.companyName}
                                            onChange={handleDetailsChange}
                                            placeholder="Optional"
                                            className="w-full bg-bg-main border border-theme rounded-xl p-4 text-primary-text focus:border-brand outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary-text/80 mb-3">GST Details (Optional)</label>
                                        <input
                                            type="text"
                                            name="gstNo"
                                            value={details.gstNo}
                                            onChange={handleDetailsChange}
                                            placeholder="GSTIN"
                                            className="w-full bg-bg-main border border-theme rounded-xl p-4 text-primary-text focus:border-brand outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-theme">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-10 py-4 bg-brand text-black font-black uppercase tracking-[0.15em] text-[10px] rounded-full shadow-lg shadow-brand/20 hover:scale-[1.05] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                    >
                                        {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} strokeWidth={2.5} />} Save Changes
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-10 animate-fade-in">
                                {/* Password Change */}
                                <form onSubmit={updateProfile} className="max-w-xl">
                                    <h3 className="text-xl font-bold text-primary-text mb-8 flex items-center gap-3">
                                        <Lock size={22} className="text-brand" strokeWidth={2.5} /> Change Password
                                    </h3>
                                    <div className="space-y-5">
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="New Password"
                                            value={passwordData.password}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-bg-main border border-theme rounded-xl p-4 text-primary-text focus:border-brand outline-none shadow-sm"
                                        />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm New Password"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-bg-main border border-theme rounded-xl p-4 text-primary-text focus:border-brand outline-none shadow-sm"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-8 px-10 py-4 border-2 border-brand text-brand font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-brand hover:text-black transition-all"
                                    >
                                        Update Password
                                    </button>
                                </form>

                                {/* 2-Step Verification (Simulated) */}
                                <div className="pt-12 border-t border-theme max-w-xl">
                                    <h3 className="text-xl font-bold text-primary-text mb-5 flex items-center gap-3">
                                        <Shield size={22} className="text-brand" strokeWidth={2.5} /> 2-Step Verification
                                    </h3>
                                    <p className="text-secondary-text/60 text-sm mb-8 font-medium leading-relaxed">
                                        Add an extra layer of security to your account. When enabled, a verification code will be required for login.
                                    </p>
                                    <div className="flex items-center justify-between bg-bg-main p-6 border border-theme rounded-2xl shadow-sm">
                                        <span className="text-primary-text font-black text-[11px] uppercase tracking-widest">
                                            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                        <button
                                            onClick={toggle2SV}
                                            disabled={loading}
                                            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-full shadow-sm disabled:opacity-50 ${twoFactorEnabled ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-brand/10 text-brand hover:bg-brand/20'
                                                }`}
                                        >
                                            {loading ? 'Changing...' : (twoFactorEnabled ? 'Disable' : 'Enable')}
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
