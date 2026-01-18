import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-secondary text-white pt-12 pb-6">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-2xl font-bold mb-4">ZAIN <span className="text-accent">INLINE</span></h3>
                    <p className="text-gray-400 text-sm">
                        Specialized manufacturer of high-quality shoe linings and materials.
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link to="/about" className="hover:text-accent">About Us</Link></li>
                        <li><Link to="/products" className="hover:text-accent">Collections</Link></li>
                        <li><Link to="/about" className="hover:text-accent">Certifications</Link></li>
                        <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Contact</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li>123 Textile Ave, Perundurai</li>
                        <li>info@zainfabrics.com</li>
                        <li>+91 98765 43210</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Newsletter</h4>
                    <p className="text-gray-400 text-sm mb-2">Subscribe for updates on new collections.</p>
                    <input type="email" placeholder="Your email" className="w-full px-3 py-2 text-gray-900 rounded text-sm mb-2" />
                    <button className="w-full bg-accent text-white py-2 rounded text-sm font-semibold hover:bg-opacity-90">SUBSCRIBE</button>
                </div>
            </div>
            <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-xs">
                &copy; {new Date().getFullYear()} Zain Fabrics. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
