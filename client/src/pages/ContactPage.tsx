import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { COMPANY_DETAILS } from '../config/companyDetails';

const ContactPage = () => {
    return (
        <div className="bg-black text-gray-200 font-sans min-h-screen pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-serif font-bold text-white mb-4">
                        Get in <span className="text-gold">Touch</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto font-light">
                        Ideally positioned to serve the global footwear industry. Visit our headquarters or reach out directly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                    {/* Contact Form */}
                    <div className="space-y-8">
                        <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
                            <h3 className="text-2xl font-serif font-medium text-white mb-6">Send us a Message</h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Name</label>
                                        <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Email</label>
                                        <input type="email" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Subject</label>
                                    <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors" placeholder="Inquiry about..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Message</label>
                                    <textarea rows={4} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors" placeholder="How can we help you?"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-gold text-black font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-white transition-all flex items-center justify-center gap-2">
                                    <Send size={18} /> Send Message
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Info & Map */}
                    <div className="space-y-12">

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-gold/50 transition-colors">
                                <Phone className="text-gold mb-4" size={24} />
                                <h4 className="text-white font-bold mb-2">Phone</h4>
                                <p className="text-gray-400 text-sm">{COMPANY_DETAILS.phone}</p>
                                <p className="text-gray-500 text-xs mt-1">Mon-Fri, 9am - 6pm</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-gold/50 transition-colors">
                                <Mail className="text-gold mb-4" size={24} />
                                <h4 className="text-white font-bold mb-2">Email</h4>
                                <p className="text-gray-400 text-sm">{COMPANY_DETAILS.email}</p>
                                <p className="text-gray-500 text-xs mt-1">24/7 Support</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-gold/50 transition-colors sm:col-span-2">
                                <MapPin className="text-gold mb-4" size={24} />
                                <h4 className="text-white font-bold mb-2">Headquarters</h4>
                                <p className="text-gray-400 text-sm">{COMPANY_DETAILS.address[0]}, {COMPANY_DETAILS.address[1]}, {COMPANY_DETAILS.address[2]}</p>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 relative group">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15643.5186789!2d77.58913!3d11.314269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDE4JzUxLjQiTiA3N8KwMzUnMjAuOSJF!5e0!3m2!1sen!2sin!4v1689765432109!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent pointer-events-none transition-colors"></div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
