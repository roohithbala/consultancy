import { Award, Globe, TrendingUp } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="bg-black text-gray-200 font-sans min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"></div>

                <div className="relative z-10 text-center max-w-4xl px-6">
                    <h1 className="text-5xl md:text-7xl font-bold font-serif text-white mb-6 animate-fade-in-up">
                        Crafting <span className="text-gold">Excellence</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 font-light tracking-wide max-w-2xl mx-auto">
                        Since 1990, Zain Fabrics has been the silent partner behind the world's most prestigious footwear brands, delivering uncompromising quality and materials.
                    </p>
                </div>
            </div>

            {/* Vision & Mission */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">Our <span className="text-gold">Heritage</span></h2>
                        <div className="space-y-6 text-gray-400 leading-relaxed font-light">
                            <p>
                                Founded in the heart of the shoe industry, Zain Fabrics emerged with a singular vision: to bridge the gap between traditional craftsmanship and modern material innovation.
                            </p>
                            <p>
                                Over three decades, we have evolved from a local supplier to a global exporter, trusted by manufacturers in Italy, Vietnam, and beyond. Our commitment to sustainable sourcing and precision engineering sets us apart.
                            </p>
                            <div className="flex gap-8 pt-6 border-t border-white/10">
                                <div>
                                    <span className="block text-4xl font-bold text-gold">30+</span>
                                    <span className="text-xs uppercase tracking-widest">Years Experience</span>
                                </div>
                                <div>
                                    <span className="block text-4xl font-bold text-gold">500+</span>
                                    <span className="text-xs uppercase tracking-widest">Global Partners</span>
                                </div>
                                <div>
                                    <span className="block text-4xl font-bold text-gold">1M+</span>
                                    <span className="text-xs uppercase tracking-widest">Meters Sold</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-gold to-transparent opacity-20 rounded-xl blur-lg transition duration-500 group-hover:opacity-40"></div>
                        <img
                            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1632"
                            alt="Factory Floor"
                            className="relative rounded-xl border border-white/10 shadow-2xl grayscale transition-all duration-500 group-hover:grayscale-0"
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-gold text-xs font-bold tracking-[0.2em] uppercase">Why Choose Us</span>
                        <h2 className="text-4xl font-serif text-white mt-4">The Zain <span className="text-gold">Standard</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Award, title: "Premium Quality", desc: "Sourced from the finest mills, every meter is inspected for perfection." },
                            { icon: Globe, title: "Global Logistics", desc: "Seamless export network ensuring timely delivery to 25+ countries." },
                            { icon: TrendingUp, title: "Industry Innovation", desc: "Constantly researching new textures, ecofriendly materials and finishes." }
                        ].map((item, i) => (
                            <div key={i} className="bg-black/40 backdrop-blur-md p-8 rounded-xl border border-white/10 hover:border-gold/30 transition-all group hover:-translate-y-2">
                                <item.icon size={40} className="text-gold mb-6 group-hover:scale-110 transition-transform" strokeWidth={1} />
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
            </section>

            {/* Partner/Brand Logos (Visual Placeholder) */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-gray-500 text-sm uppercase tracking-widest mb-10">Trusted by Leading Brands</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Simple text placeholders for logos for now, or use images if available */}
                        {['GUCCI', 'NIKE', 'ADIDAS', 'CLARKS', 'BATA', 'HUSH PUPPIES'].map((brand) => (
                            <span key={brand} className="text-2xl font-serif font-bold text-gray-300 hover:text-gold transition-colors cursor-default">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
