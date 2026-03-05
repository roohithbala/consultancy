import { ArrowRight, Globe, CheckCircle, Play } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const LandingPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    // If logged in, redirect to the shopping experience (Products Page)
    if (user) {
        return <Navigate to="/products" replace />;
    }

    const exports = [
        { name: 'KH Shoes', location: 'Strategic Hub' },
        { name: 'NMZ Shoes', location: 'Global Export' },
        { name: 'NMH Shoes', location: 'Premium Line' },
        { name: 'ISPL', location: 'Distribution' },
        { name: 'Kenmore Shoes', location: 'Design Center' },
        { name: 'Excellent Shoes', location: 'Global Export' },
        { name: 'Mohib Shoes', location: 'Strategic Hub' },
        { name: 'Calidas', location: 'Premium Line' },
        { name: 'Gobi Shoes', location: 'Design Center' },
        { name: 'SNS Clothing', location: 'Global Export' },
    ];

    const processes = [
        'COATINGS',
        'INTERLININGS',
        'RAISING',
        'DRILL',
        'JERSEY',
        'CANVAS',
        'BONDING',
        'FOAM LAMINATIONS',
        'Advanced Fusing',
        'Polyester Printing',
        'Precision Sizing',
        'Premium Weaving',
        'Dye & Wash',
        'Eva Polymer Coating',
        'Dot Coating'
    ];

    return (
        <div className="bg-primary text-primary font-sans selection:bg-gold selection:text-black scroll-smooth transition-colors duration-300">
            {/* Hero Section - Video Background */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10"></div>
                    {/* Simulated Abstract Video Background using CSS Animation */}
                    <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black animate-pulse opacity-80 scale-110"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gold/5 rounded-full blur-[120px] animate-pulse duration-1000"></div>
                </div>

                <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">
                    <div className="inline-flex items-center gap-2 border border-white/10 px-5 py-2.5 rounded-full mb-8 glass animate-fade-in">
                        <span className="w-1.5 h-1.5 bg-[#c29b28] rounded-full animate-pulse"></span>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-bold">Global Manufacturing • Est. 2024</span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-extrabold mb-10 leading-tight tracking-tighter text-white animate-fade-in">
                        Material <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c29b28] via-[#fcd34d] to-[#c29b28] italic font-normal pr-4">Excellence</span>
                    </h1>

                    <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in delay-100">
                        Engineered shoe materials for the world's leading brands. <br />
                        Defining quality on the <span className="text-white font-bold border-b border-[#c29b28]">Global Stage</span>.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in delay-200">
                        <Link to="/products" className="group relative px-12 py-5 bg-[#c29b28] text-black font-bold uppercase tracking-[0.2em] text-xs overflow-hidden transition-all hover:scale-105 active:scale-95">
                            <span className="relative z-10 flex items-center gap-3">
                                Explore Collection <ArrowRight size={18} />
                            </span>
                            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 origin-left"></div>
                        </Link>

                        <Link to="/contact" className="group px-10 py-5 border border-white/20 text-white font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-colors flex items-center gap-3">
                            <Play size={16} className="fill-current" /> Watch Our Story
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <span className="text-white/30 text-[10px] uppercase tracking-widest writing-vertical-rl">Scroll to Discover</span>
                </div>
            </section>

            {/* Global Presence Section - Map Visualization */}
            <section className="py-32 bg-secondary relative overflow-hidden transition-colors duration-300">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <span className="text-gold uppercase tracking-[0.2em] text-sm font-bold mb-4 block">Strategic Network</span>
                            <h2 className="text-4xl md:text-6xl font-serif text-primary mb-8 leading-tight">
                                Powering the <br />
                                <span className="text-gold">Global Footwear Industry</span>
                            </h2>
                            <p className="text-secondary text-lg leading-relaxed mb-12 font-light">
                                Zain Fabrics stands at the intersection of tradition and innovation.
                                Based in the heart of India's leather hub, we connect local craftsmanship
                                with international standards, supplying critical components to manufacturers who craft for the world.
                            </p>

                            <div className="border-t border-theme pt-8">
                                <div>
                                    <h3 className="text-5xl font-bold text-primary mb-2">3</h3>
                                    <p className="text-gold uppercase text-xs tracking-widest">Key Manufacturing Hubs</p>
                                    <p className="text-secondary text-xs mt-1">Ranipet • Global Stage • Chennai</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            {/* Abstract Map using CSS/SVG */}
                            <div className="aspect-square rounded-[2rem] border border-theme glass-card relative p-12 flex items-center justify-center shadow-2xl">
                                <div className="absolute inset-0 bg-[#c29b28]/5 rounded-[2rem] blur-3xl"></div>
 
                                {/* Central Hub */}
                                <div className="relative z-10">
                                    <div className="w-48 h-48 rounded-full border border-[#c29b28]/20 flex items-center justify-center relative animate-[spin_20s_linear_infinite]">
                                        <div className="w-1.5 h-1.5 bg-[#c29b28] rounded-full absolute top-0 -translate-y-1/2"></div>
                                        <div className="w-1.5 h-1.5 bg-[#c29b28] rounded-full absolute bottom-0 translate-y-1/2"></div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <Globe size={56} className="text-[#c29b28] mx-auto mb-3 opacity-60" strokeWidth={0.5} />
                                            <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">India Hub</span>
                                        </div>
                                    </div>
 
                                    {/* Orbiting Nodes (Exports) */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] border border-theme/30 rounded-full animate-[spin_30s_linear_infinite_reverse]">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 glass border border-[#c29b28]/30 rounded-full flex items-center justify-center">
                                            <div className="w-1 h-1 bg-[#c29b28] rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Specialized Processes */}
            <section className="py-32 bg-primary transition-colors duration-300">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-theme pb-8">
                        <div>
                            <span className="text-gold uppercase tracking-widest text-sm font-bold">Our Expertise</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-primary mt-4">Precision Manufacturing</h2>
                        </div>
                        <Link to="/about" className="text-white hover:text-gold transition-colors flex items-center gap-2 uppercase text-xs font-bold tracking-widest mt-6 md:mt-0">
                            View All Capabilities <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                        {processes.map((process, index) => (
                            <div key={index} className="group relative h-64 border border-white/5 bg-gray-900/20 overflow-hidden hover:bg-white/5 transition-all duration-500">
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-transform duration-500 group-hover:-translate-y-2">
                                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-gray-400 mb-6 group-hover:border-gold group-hover:text-gold transition-colors">
                                        <CheckCircle size={24} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white font-serif group-hover:text-gold transition-colors">{process}</h3>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                            </div>
                        ))}
                        <div className="group relative h-64 border border-white/5 bg-gold/10 overflow-hidden hover:bg-gold/20 transition-all duration-500 flex items-center justify-center">
                            <span className="text-gold font-bold uppercase tracking-widest text-sm group-hover:scale-110 transition-transform cursor-pointer">
                                + Custom Solutions
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted Partners - Marquee */}
            <section className="py-24 bg-gray-900 border-t border-white/5 relative overflow-hidden">
                <div className="container mx-auto px-6 text-center mb-12">
                    <p className="text-gray-500 uppercase tracking-[0.2em] text-xs font-bold">Trusted by Industry Leaders</p>
                </div>

                <div className="relative flex overflow-x-hidden group">
                    <div className="py-12 animate-marquee whitespace-nowrap flex gap-32">
                        {/* Repeat specific items for smooth loop */}
                        {[...exports, ...exports].map((partner, index) => (
                            <span key={index} className="text-3xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-gray-600 to-gray-800 hover:from-white hover:to-gray-400 transition-all cursor-default select-none">
                                {partner.name}
                            </span>
                        ))}
                    </div>
                    {/* Absolute Gradients for Fade Effect */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-900 to-transparent z-10"></div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
