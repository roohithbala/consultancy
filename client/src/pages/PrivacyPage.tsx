import { Shield, Lock, Eye, Server, Globe, FileText } from 'lucide-react';

const PrivacyPage = () => {
    return (
        <div className="bg-bg-main min-h-screen pt-32 pb-20 text-primary-text font-sans transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <div className="mb-20 text-center">
                    <span className="text-brand text-[10px] font-black tracking-[0.4em] uppercase mb-4 block animate-fade-in">Zenith Integrity Standards</span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter animate-fade-in group">
                        Privacy <span className="italic font-normal opacity-60 text-secondary-text">Charter</span>
                    </h1>
                    <p className="text-secondary-text text-lg font-light leading-relaxed max-w-2xl mx-auto">
                        At Zain Fabrics, we protect your industrial data with the same precision we apply to our textiles. 
                        Your privacy is our foundation.
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Section 1: Data Architecture */}
                    <section className="bg-bg-alt/30 border border-border/10 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-brand/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[50px] -z-10 group-hover:bg-brand/10 transition-all"></div>
                        <div className="flex gap-8 items-start">
                            <div className="p-4 bg-brand/10 rounded-2xl border border-brand/20 text-brand shrink-0">
                                <Shield size={32} strokeWidth={1} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-6 tracking-tight">Industrial Data Collection</h2>
                                <div className="space-y-4 text-secondary-text leading-relaxed font-light">
                                    <p>We collect technical specifications, custom requirements, and ordering patterns to optimize our manufacturing cycles. This includes:</p>
                                    <ul className="list-none space-y-3">
                                        <li className="flex items-center gap-3"><span className="w-1 h-1 bg-brand rounded-full"></span> Technical material preferences</li>
                                        <li className="flex items-center gap-3"><span className="w-1 h-1 bg-brand rounded-full"></span> Design customization notes</li>
                                        <li className="flex items-center gap-3"><span className="w-1 h-1 bg-brand rounded-full"></span> Shipping and verification logistics</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Security */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-bg-main border border-border/10 p-8 rounded-[2rem]">
                            <Lock className="text-brand mb-6" size={24} />
                            <h3 className="text-xl font-bold mb-4 tracking-tight">Encrypted Transactions</h3>
                            <p className="text-secondary-text text-sm leading-relaxed font-light">
                                All financial interactions, including sample verifications and bulk ordering through our Zenith portal, are protected by end-to-end 256-bit encryption.
                            </p>
                        </div>
                        <div className="bg-bg-main border border-border/10 p-8 rounded-[2rem]">
                            <Eye className="text-brand mb-6" size={24} />
                            <h3 className="text-xl font-bold mb-4 tracking-tight">Transparency Proxy</h3>
                            <p className="text-secondary-text text-sm leading-relaxed font-light">
                                We believe in full visibility. You have the right to request a complete audit of the data we hold regarding your manufacturing history.
                            </p>
                        </div>
                    </section>

                    {/* Section 3: Global Compliance */}
                    <section className="bg-bg-alt/50 border border-border/10 p-10 rounded-[2.5rem]">
                        <div className="flex flex-col md:flex-row gap-12">
                            <div className="md:w-1/3">
                                <span className="text-brand text-[9px] font-black tracking-[0.3em] uppercase mb-4 block">Compliance</span>
                                <h2 className="text-3xl font-bold tracking-tighter leading-tight">Global Sourcing Standards</h2>
                            </div>
                            <div className="md:w-2/3 space-y-8">
                                <div className="flex gap-5">
                                    <Globe className="text-brand shrink-0" size={20} />
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-widest mb-2">GDPR & International Law</h4>
                                        <p className="text-secondary-text text-sm font-light">
                                            Adhering to strict international data protection laws to ensure our partners in Europe, Vietnam, and Italy remain fully compliant.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-5">
                                    <Server className="text-brand shrink-0" size={20} />
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-widest mb-2">Infrastructure Security</h4>
                                        <p className="text-secondary-text text-sm font-light">
                                            Our database is hosted in highly secure Tier-4 environments with daily redundancy clusters and automated threat detection.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer Contact */}
                    <div className="pt-20 border-t border-border/10 text-center">
                        <p className="text-secondary-text/60 text-[10px] uppercase font-black tracking-[0.3em] mb-6">Inquiries Regarding Data Rights</p>
                        <a href="mailto:privacy@zainfabrics.com" className="text-2xl font-serif font-bold text-brand hover:text-white transition-colors">
                            support@zainfabrics.com
                        </a>
                        <div className="mt-12 flex justify-center gap-10">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-secondary-text/30" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-secondary-text/30">Version 2.4.0</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-brand" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-brand">Authenticated Original</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckCircle = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export default PrivacyPage;
