import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { COMPANY_DETAILS } from '../config/companyDetails';

const ContactPage = () => {
    return (
        <div className="bg-bg-main text-primary-text font-sans min-h-screen pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-serif font-black text-primary-text mb-6 uppercase tracking-widest">
                        Get in <span className="text-brand italic font-normal">Touch</span>
                    </h1>
                    <p className="text-secondary-text max-w-2xl mx-auto font-light">
                        Ideally positioned to serve the global footwear industry. Visit our headquarters or reach out directly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                    {/* Contact Form */}
                    <div className="space-y-8">
                        <div className="bg-bg-main border border-theme p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full"></div>
                            <h3 className="text-2xl font-serif font-medium text-primary-text mb-6 italic">
                                Send us a <span className="text-brand not-italic">Message</span>
                            </h3>
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
                                    <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand/emerald focus:outline-none transition-colors" placeholder="Inquiry about..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Message</label>
                                    <textarea rows={4} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand/emerald focus:outline-none transition-colors" placeholder="How can we help you?"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-brand text-black font-black uppercase tracking-[0.3em] py-5 rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.3)] group active:scale-95">
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send Directive
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Info & Map */}
                    <div className="space-y-12">

                         {/* Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="bg-bg-main p-8 rounded-3xl border border-theme hover:border-brand/40 transition-all group shadow-sm">
                                <Phone className="text-brand mb-6 group-hover:scale-110 transition-transform" size={28} strokeWidth={1} />
                                <h4 className="text-primary-text font-black text-[10px] uppercase tracking-[0.2em] mb-3">Direct Line</h4>
                                <p className="text-secondary-text text-sm font-medium">{COMPANY_DETAILS.phone}</p>
                                <p className="text-secondary-text/40 text-[10px] mt-2 font-bold uppercase tracking-widest">Mon-Fri, 9am - 6pm</p>
                            </div>
                            <div className="bg-bg-main p-8 rounded-3xl border border-theme hover:border-brand/40 transition-all group shadow-sm">
                                <Mail className="text-brand mb-6 group-hover:scale-110 transition-transform" size={28} strokeWidth={1} />
                                <h4 className="text-primary-text font-black text-[10px] uppercase tracking-[0.2em] mb-3">Email</h4>
                                <p className="text-secondary-text text-sm font-medium">{COMPANY_DETAILS.email}</p>
                                <p className="text-secondary-text/40 text-[10px] mt-2 font-bold uppercase tracking-widest">24/7 Global Support</p>
                            </div>
                            <div className="bg-bg-main p-8 rounded-3xl border border-theme hover:border-brand/40 transition-all group shadow-sm sm:col-span-2">
                                <MapPin className="text-brand mb-6 group-hover:scale-110 transition-transform" size={28} strokeWidth={1} />
                                <h4 className="text-primary-text font-black text-[10px] uppercase tracking-[0.2em] mb-3">Strategic HQ</h4>
                                <p className="text-secondary-text text-sm font-medium leading-relaxed">{COMPANY_DETAILS.address.join(', ')}</p>
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
