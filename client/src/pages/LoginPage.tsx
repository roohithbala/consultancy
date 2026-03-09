import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Phone, Building, FileText, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [gstNo, setGstNo] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [regStep, setRegStep] = useState(1); // 1: Login, 2: Complete Profile, 3: 2SV Verification
    const [googleToken, setGoogleToken] = useState('');
    const [pendingUserId, setPendingUserId] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.require2SV) {
                    setPendingUserId(data.userId);
                    setRegStep(3);
                } else {
                    dispatch(setCredentials(data));
                    navigate(data.role === 'admin' ? '/admin' : '/');
                }
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection failed. Is the server running?');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: pendingUserId, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                dispatch(setCredentials(data));
                navigate(data.role === 'admin' ? '/admin' : '/');
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('Connection failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        const token = credentialResponse.credential;
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tokenId: token }),
            });

            const data = await res.json();

            if (res.ok) {
                if (!data.phone) {
                    setGoogleToken(token);
                    setRegStep(2);
                } else {
                    dispatch(setCredentials(data));
                    navigate(data.role === 'admin' ? '/admin' : '/');
                }
            } else {
                setError(data.details || data.message || 'Google Login failed');
            }
        } catch (err) {
            setError('Server connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) {
            setError('Phone number is required');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    tokenId: googleToken,
                    phone,
                    companyName,
                    gstNo
                }),
            });

            const data = await res.json();
            if (res.ok) {
                dispatch(setCredentials(data));
                navigate(data.role === 'admin' ? '/admin' : '/');
            } else {
                setError(data.message || 'Failed to complete profile');
            }
        } catch (err) {
            setError('Connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-bg-main relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary via-bg-main to-bg-main z-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md p-10 bg-bg-main/40 backdrop-blur-xl border border-theme relative z-10 shadow-2xl transition-all duration-500">
                {regStep === 1 && (
                    <>
                        <div className="text-center mb-10">
                            <span className="text-brand uppercase tracking-[0.3em] text-xs font-bold">Welcome Back</span>
                            <h2 className="text-4xl font-serif font-bold text-primary-text mt-4">Login</h2>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 mb-6 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-secondary border border-theme text-primary-text pl-12 pr-4 py-4 focus:border-brand focus:outline-none transition-all placeholder:text-gray-500"
                                    placeholder="Email"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-secondary border border-theme text-primary-text pl-12 pr-4 py-4 focus:border-brand focus:outline-none transition-all placeholder:text-gray-500"
                                    placeholder="Password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-brand text-black py-4 font-bold uppercase tracking-widest hover:bg-brand/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mb-4"
                            >
                                {isLoading ? 'Wait...' : 'Login'}
                                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>

                            <div className="relative flex items-center justify-center my-6">
                                <div className="border-t border-theme w-full"></div>
                                <span className="bg-bg-main px-4 text-[10px] font-black uppercase tracking-widest text-secondary-text absolute">OR</span>
                            </div>

                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google Login Failed')}
                                    useOneTap
                                    theme="filled_black"
                                    shape="square"
                                    width="250"
                                />
                            </div>
                        </form>

                        <p className="mt-8 text-center text-sm text-secondary-text">
                            New? <Link to="/register" className="text-primary-text hover:text-brand transition-colors font-bold ml-2">Create Account</Link>
                        </p>
                    </>
                )}

                {regStep === 2 && (
                    <>
                        <div className="text-center mb-8">
                            <span className="text-brand uppercase tracking-[0.3em] text-xs font-bold">Almost there</span>
                            <h2 className="text-4xl font-serif font-bold text-primary-text mt-4">Tell us more</h2>
                            <p className="text-secondary-text text-sm mt-2">Please provide your contact details to finish.</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 mb-6 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleGoogleComplete} className="space-y-6">
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" size={20} />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-secondary border border-theme text-primary-text pl-12 pr-4 py-4 focus:border-brand focus:outline-none transition-all placeholder:text-gray-500"
                                    placeholder="Phone Number"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="relative group">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full bg-secondary border border-theme text-primary-text pl-12 pr-4 py-4 focus:border-brand focus:outline-none transition-all placeholder:text-gray-500"
                                    placeholder="Company Name (Optional)"
                                />
                            </div>

                            <div className="relative group">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={gstNo}
                                    onChange={(e) => setGstNo(e.target.value)}
                                    className="w-full bg-secondary border border-theme text-primary-text pl-12 pr-4 py-4 focus:border-brand focus:outline-none transition-all placeholder:text-gray-500"
                                    placeholder="GST No (Optional)"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-brand text-black py-4 font-bold uppercase tracking-widest hover:bg-brand/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mb-4"
                            >
                                {isLoading ? 'Wait...' : 'Complete Profile'}
                                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    </>
                )}

                {regStep === 3 && (
                    <>
                        <div className="text-center mb-8">
                            <ShieldCheck className="mx-auto text-brand mb-4" size={48} />
                            <span className="text-brand uppercase tracking-[0.3em] text-xs font-bold">Step 2</span>
                            <h2 className="text-4xl font-serif font-bold text-primary-text mt-4">Verify</h2>
                            <p className="text-secondary-text text-sm mt-2">Enter the verification code sent to your email.</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 mb-6 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="relative group">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-secondary border border-theme text-primary-text pl-12 pr-4 py-10 text-center text-4xl tracking-[0.5em] font-bold focus:border-brand focus:outline-none transition-all placeholder:text-gray-500"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-brand text-black py-4 font-bold uppercase tracking-widest hover:bg-brand/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mb-4"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Login'}
                                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setRegStep(1)}
                                className="w-full text-secondary-text py-2 text-sm hover:text-primary-text transition-colors"
                            >
                                ← Back to Login
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
