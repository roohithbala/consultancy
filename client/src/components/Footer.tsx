import { Link } from 'react-router-dom';
import { COMPANY_DETAILS } from '../config/companyDetails';

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-20 pb-10 border-t border-white/10">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-6">
                    <h3 className="text-3xl font-serif font-bold tracking-wider">ZAIN <span className="text-gold">FABRICS</span></h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                        Crafting the finest shoe linings and materials since 2026. Engineered for luxury, designed for durability.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-sm tracking-widest uppercase mb-6 text-gold">Explore</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link to="/about" className="hover:text-white transition-colors duration-300">Our Heritage</Link></li>
                        <li><Link to="/products" className="hover:text-white transition-colors duration-300">Collections</Link></li>
                        <li><Link to="/about" className="hover:text-white transition-colors duration-300">Certifications</Link></li>
                        <li><Link to="/contact" className="hover:text-white transition-colors duration-300">Contact Studio</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-sm tracking-widest uppercase mb-6 text-gold">Get in Touch</h4>
                    <ul className="space-y-4 text-sm text-gray-400">
                        {COMPANY_DETAILS.address.map((line, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className="block">{line}</span>
                            </li>
                        ))}
                        <li>
                            <a href={`mailto:${COMPANY_DETAILS.email}`} className="hover:text-white transition-colors">{COMPANY_DETAILS.email}</a>
                        </li>
                        <li>
                            <a href={`tel:${COMPANY_DETAILS.phone}`} className="hover:text-white transition-colors">{COMPANY_DETAILS.phone}</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-sm tracking-widest uppercase mb-6 text-gold">Newsletter</h4>
                    <p className="text-gray-400 text-sm mb-4">Subscribe for exclusive updates on new collections.</p>
                    <div className="space-y-3">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                        />
                        <button className="w-full bg-gold text-black py-3 text-sm font-bold tracking-widest uppercase hover:bg-white transition-colors duration-300">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-600 text-xs">
                    &copy; {new Date().getFullYear()} Zain Fabrics. All rights reserved.
                </p>
                <div className="flex gap-6 text-xs text-gray-600">
                    <Link to="#" className="hover:text-white">Privacy Policy</Link>
                    <Link to="#" className="hover:text-white">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
