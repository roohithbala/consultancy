import { Link } from 'react-router-dom';
import { COMPANY_DETAILS } from '../config/companyDetails';
import { Globe, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-primary border-t border-theme pt-24 pb-12 relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background Glow */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[150px] -z-10 opacity-50"></div>

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
                    {/* Brand column */}
                    <div className="md:col-span-5 space-y-8">
                        <Link to="/" className="text-4xl font-serif font-black tracking-widest uppercase inline-block text-primary">
                            ZAIN <span className="text-brand italic font-normal">FABRICS</span>
                        </Link>
                        <p className="text-secondary text-sm leading-relaxed max-w-sm font-medium">
                            Crafting the world's finest textile solutions for the global footwear industry. Driven by precision, defined by material excellence.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary border border-theme hover:border-brand/40 transition-all hover:-translate-y-1 cursor-pointer group flex items-center justify-center shadow-sm">
                                <Globe size={20} className="text-secondary group-hover:text-brand transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Navigation column */}
                    <div className="md:col-span-2">
                        <h4 className="font-black text-[10px] tracking-[0.3em] uppercase mb-8 text-brand">Navigation</h4>
                        <ul className="space-y-4 text-[11px] font-bold text-secondary uppercase tracking-widest">
                            <li>
                                <Link to="/about" className="hover:text-brand transition-all duration-300 flex items-center gap-2 group">
                                    <span className="w-0 group-hover:w-3 h-[1px] bg-brand transition-all"></span> Our Heritage
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="hover:text-brand transition-all duration-300 flex items-center gap-2 group">
                                    <span className="w-0 group-hover:w-3 h-[1px] bg-brand transition-all"></span> Collections
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-brand transition-all duration-300 flex items-center gap-2 group">
                                    <span className="w-0 group-hover:w-3 h-[1px] bg-brand transition-all"></span> Certifications
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact column */}
                    <div className="md:col-span-12 lg:col-span-5">
                        <h4 className="font-black text-[10px] tracking-[0.3em] uppercase mb-8 text-brand">Studio Contact</h4>
                        <div className="grid grid-cols-1 gap-8">
                            <div className="flex gap-5">
                                <div className="p-3 bg-secondary rounded-2xl border border-theme h-fit flex-shrink-0">
                                    <MapPin size={20} className="text-brand" />
                                </div>
                                <div className="text-[11px] font-bold text-secondary uppercase tracking-widest leading-relaxed">
                                    {COMPANY_DETAILS.address.map((line, idx) => (
                                        <span key={idx} className="block">{line}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-8">
                                <div className="flex items-center gap-5 group">
                                    <div className="p-4 bg-secondary rounded-2xl border border-theme group-hover:border-brand/30 transition-colors shadow-sm flex-shrink-0">
                                        <Mail size={18} className="text-brand" />
                                    </div>
                                    <a href={`mailto:${COMPANY_DETAILS.email}`} className="text-[11px] font-bold text-secondary uppercase tracking-widest hover:text-brand transition-colors">
                                        {COMPANY_DETAILS.email}
                                    </a>
                                </div>
                                <div className="flex items-center gap-5 group">
                                    <div className="p-4 bg-secondary rounded-2xl border border-theme group-hover:border-brand/30 transition-colors shadow-sm flex-shrink-0">
                                        <Phone size={18} className="text-brand" />
                                    </div>
                                    <a href={`tel:${COMPANY_DETAILS.phone}`} className="text-[11px] font-bold text-secondary uppercase tracking-widest hover:text-brand transition-colors">
                                        {COMPANY_DETAILS.phone}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-12 border-t border-theme flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
                            &copy; {new Date().getFullYear()} Zain Fabrics &bull; Est. 2014 &bull; Precision Engineered
                        </p>
                    </div>
                    <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
                        <Link to="/privacy" className="hover:text-brand transition-colors">Privacy Charter</Link>
                        <Link to="/terms" className="hover:text-brand transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
