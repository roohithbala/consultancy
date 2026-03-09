import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { User, Mail, Lock, ArrowRight, Phone, Building, FileText } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [gstNo, setGstNo] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [regStep, setRegStep] = useState(1); // 1: Initial, 2: Google Info
    const [googleToken, setGoogleToken] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        console.log('Attempting registration for:', email);

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, phone, companyName, gstNo }),
            });

            console.log('Registration response status:', res.status);
            const data = await res.json();

            if (res.ok) {
                console.log('Registration successful');
                dispatch(setCredentials(data));
                navigate('/');
            } else {
                console.warn('Registration failed:', data.message);
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration request error:', err);
            setError('Connection failed. Is the server running?');
        } finally {
            console.log('Registration process finished, clearing loading state');
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        const token = credentialResponse.credential;
        
        // If phone is missing, move to step 2 "Tell us more"
        if (!phone) {
            setGoogleToken(token);
            setRegStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // If phone already filled (from form or previous attempt), proceed
        await submitGoogleLogin(token);
    };

    const submitGoogleLogin = async (token: string) => {
        setIsLoading(true);
        setError('');
        console.log('Google registration fetch triggered');
        try {
            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    tokenId: token,
                    phone,
                    companyName,
                    gstNo
                }),
            });

            const data = await res.json();
            console.log('Google registration response:', data);

            if (res.ok) {
                dispatch(setCredentials(data));
                navigate('/');
            } else {
                setError(data.details || data.message || 'Google Login failed');
            }
        } catch (err) {
            console.error('Google registration request error:', err);
            setError('Google Login failed. Server connection error.');
        } finally {
            console.log('Google registration process finished, clearing loading state');
            setIsLoading(false);
        }
    };

    const handleGoogleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) {
            setError('Phone number is required');
            return;
        }
        await submitGoogleLogin(googleToken);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-bg-main relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary via-bg-main to-bg-main z-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-2xl p-10 bg-bg-main/40 backdrop-blur-xl border border-theme relative z-10 shadow-2xl">
                {regStep === 1 ? (
                    <>
                        <div className="text-center mb-8">
                            <span className="text-brand uppercase tracking-[0.3em] text-xs font-bold">Join Us</span>
                            <h2 className="text-4xl font-serif font-bold text-primary-text mt-4">Register</h2>
                            <p className="text-secondary-text text-sm mt-2">Fill in your details and join via Email or Google</p>
                        </div>

                        <div className="flex justify-center mb-8">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Login Failed')}
                                useOneTap
                                theme="filled_black"
                                shape="square"
                                width="300"
                                text="signup_with"
                            />
                        </div>

                        <div className="relative flex items-center justify-center mb-8">
                            <div className="border-t border-theme w-full"></div>
                            <span className="bg-bg-main px-4 text-[10px] font-black uppercase tracking-widest text-secondary-text absolute">OR USE EMAIL</span>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 mb-6 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group md:col-span-2">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" size={20} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-secondary border border-theme text-primary-text pl-12 pr-4 py-4 focus:border-brand focus:outline-none transition-all placeholder:text-gray-500"
                                        placeholder="Name"
                                        required
                                    />
                                </div>

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
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" size={20} />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-secondary border border-theme text-primary-text pl-12 pr-4 py-4 focus:border-brand focus:outline-none transition-all placeholder:text-gray-500"
                                        placeholder="Phone Number"
                                        required
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

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" size={20} />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-secondary border border-theme text-primary-text pl-12 pr-4 py-4 focus:border-brand focus:outline-none transition-all placeholder:text-gray-500"
                                        placeholder="Confirm Password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-brand text-black py-4 font-bold uppercase tracking-widest hover:bg-brand/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mb-4"
                            >
                                {isLoading ? 'Wait...' : 'Join'}
                                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-secondary-text">
                            Joined? <Link to="/login" className="text-primary-text hover:text-brand transition-colors font-bold ml-2">Login</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <span className="text-brand uppercase tracking-[0.3em] text-xs font-bold">Step 2</span>
                            <h2 className="text-4xl font-serif font-bold text-primary-text mt-4">Tell us more</h2>
                            <p className="text-secondary-text text-sm mt-2">Finish setting up your account</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 mb-6 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleGoogleComplete} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group md:col-span-2">
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
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-brand text-black py-4 font-bold uppercase tracking-widest hover:bg-brand/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mb-4"
                            >
                                {isLoading ? 'Wait...' : 'Complete Signup'}
                                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setRegStep(1)}
                                className="w-full text-secondary-text py-2 text-sm hover:text-primary-text transition-colors"
                            >
                                ← Back to choices
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;
