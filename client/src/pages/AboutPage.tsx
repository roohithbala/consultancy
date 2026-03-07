import { Award, Globe, TrendingUp } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="bg-bg-main text-primary-text font-sans min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-accent-dark">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"></div>

                <div className="relative z-10 text-center max-w-4xl px-6">
                    <h1 className="text-5xl md:text-7xl font-bold font-serif text-white mb-6 animate-fade-in-up drop-shadow-lg">
                        Crafting <span className="text-brand">Excellence</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 font-light tracking-wide max-w-2xl mx-auto">
                        Since 2014, Zain Fabrics has been the silent partner behind the world's most prestigious footwear brands, delivering uncompromising quality and materials.
                    </p>
                </div>
            </div>

            {/* Vision & Mission */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif text-primary-text mb-6">Our <span className="text-brand">Heritage</span></h2>
                        <div className="space-y-6 text-secondary-text leading-relaxed font-light">
                            <p>
                                Founded in the heart of the shoe industry, Zain Fabrics emerged with a singular vision: to bridge the gap between traditional craftsmanship and modern material innovation.
                            </p>
                            <p>
                                Over three decades, we have evolved from a local supplier to a global exporter, trusted by manufacturers in Italy, Vietnam, and beyond. Our commitment to sustainable sourcing and precision engineering sets us apart.
                            </p>
                            <div className="flex gap-8 pt-6 border-t border-border">
                                <div>
                                    <span className="block text-4xl font-bold text-brand italic tracking-tighter shadow-brand/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]">30+</span>
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-secondary-text/40">Years Experience</span>
                                </div>
                                <div>
                                    <span className="block text-4xl font-bold text-brand italic tracking-tighter shadow-brand/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]">500+</span>
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-secondary-text/40">Global Partners</span>
                                </div>
                                <div>
                                    <span className="block text-4xl font-bold text-brand italic tracking-tighter shadow-brand/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]">1M+</span>
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-secondary-text/40">Meters Sold</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-brand to-transparent opacity-20 rounded-xl blur-lg transition duration-500 group-hover:opacity-40"></div>
                        <img
                            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1632"
                            alt="Factory Floor"
                            className="relative rounded-xl border border-white/10 shadow-2xl grayscale transition-all duration-500 group-hover:grayscale-0"
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 bg-bg-alt relative overflow-hidden transition-colors duration-500">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand/5 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <span className="text-brand text-[10px] font-black tracking-[0.4em] uppercase">The Zain Quality</span>
                        <h2 className="text-4xl md:text-6xl font-serif text-primary-text mt-6 font-bold tracking-tight italic">Precision <span className="text-brand opacity-80 not-italic">Standard</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {[
                            { icon: Award, title: "Premium Quality", desc: "Sourced from the finest mills, every meter is inspected for perfection." },
                            { icon: Globe, title: "Global Logistics", desc: "Seamless export network ensuring timely delivery to 25+ countries." },
                            { icon: TrendingUp, title: "Industry Innovation", desc: "Constantly researching new textures, ecofriendly materials and finishes." }
                        ].map((item, i) => (
                            <div key={i} className="bg-bg-main p-12 rounded-[2.5rem] border border-border/5 hover:border-brand/30 transition-all duration-700 group hover:-translate-y-2 shadow-xl shadow-black/5 dark:shadow-none">
                                <item.icon size={48} className="text-brand mb-10 group-hover:scale-110 transition-transform" strokeWidth={0.5} />
                                <h3 className="text-2xl font-black text-primary-text mb-5 tracking-tight">{item.title}</h3>
                                <p className="text-secondary-text/60 text-[13px] leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand/5 to-transparent"></div>
            </section>

        </div>
    );
};

export default AboutPage;
