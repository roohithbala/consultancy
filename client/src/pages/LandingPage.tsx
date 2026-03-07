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
        <div className="bg-bg-main text-primary-text font-sans selection:bg-brand/30 selection:text-brand scroll-smooth transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden bg-bg-main text-primary-text">
                <div className="absolute inset-0 z-0 bg-bg-main">
                    <div className="absolute inset-0 dark:bg-black/60 z-10 transition-colors duration-500"></div>
                    
                    {/* Simplified Premium Background for Maximum Contrast */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand/5 rounded-full blur-[120px]"></div>
                        
                        {/* Technical Grid with higher opacity for depth */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-color)_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.15] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,#000_20%,transparent_100%)]"></div>
                    </div>
                </div>

                <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">
                    <div className="inline-flex items-center gap-2 border border-theme px-5 py-2.5 rounded-full mb-8 bg-bg-main shadow-sm">
                        <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse"></span>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-primary-text font-black">ESTD 2014</span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black mb-10 leading-tight tracking-tighter text-primary-text">
                        Material <br /> <span className="text-brand italic font-normal pr-4">Excellence</span>
                    </h1>

                    <p className="text-xl md:text-2xl mb-12 text-secondary-text max-w-3xl mx-auto leading-relaxed font-light">
                        Engineered shoe materials for the world's leading brands. <br />
                        Defining quality on the <span className="text-brand font-bold border-b-2 border-brand pb-1">Global Stage</span>.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link to="/products" className="group relative px-14 py-6 bg-brand text-black font-black uppercase tracking-[0.3em] text-[10px] overflow-hidden transition-all hover:scale-105 active:scale-95 rounded-full shadow-2xl shadow-brand/20">
                            <span className="relative z-10 flex items-center gap-3">
                                Explore Collection <ArrowRight size={18} strokeWidth={3} />
                            </span>
                            <div className="absolute inset-0 bg-white/40 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out origin-left"></div>
                        </Link>

                        <Link to="/contact" className="group px-12 py-6 border border-theme text-primary-text font-black uppercase tracking-[0.3em] text-[10px] hover:border-brand hover:text-brand transition-all flex items-center gap-3 rounded-full bg-secondary shadow-sm">
                            <Play size={16} className="fill-current" strokeWidth={3} /> Our Story
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <span className="text-secondary-text/30 text-[10px] uppercase tracking-widest writing-vertical-rl">Scroll</span>
                </div>
            </section>

            {/* Global Presence Section - Map Visualization */}
            <section className="py-32 bg-bg-alt relative overflow-hidden transition-colors duration-300">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <span className="text-brand uppercase tracking-[0.3em] text-xs font-black mb-4 block">Strategic Network</span>
                            <h2 className="text-4xl md:text-6xl font-serif text-primary-text mb-8 leading-tight font-bold">
                                Powering the <br />
                                <span className="text-brand italic font-normal">Global Footwear Industry</span>
                            </h2>
                            <p className="text-secondary-text text-lg leading-relaxed mb-12 font-light">
                                Zain Fabrics stands at the intersection of tradition and innovation.
                                Based in the heart of India's leather hub, we connect local craftsmanship
                                with international standards, supplying critical components to manufacturers who craft for the world.
                            </p>

                            <div className="border-t border-border/10 pt-8">
                                 <div>
                                    <h3 className="text-6xl font-black text-primary-text mb-2 tracking-tighter italic">3</h3>
                                    <p className="text-brand uppercase text-[10px] font-black tracking-[0.2em]">Key Manufacturing Hubs</p>
                                    <p className="text-secondary-text/60 text-[10px] mt-1 font-bold uppercase tracking-wider">Ranipet • Global Stage • Chennai</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            {/* Abstract Map using CSS/SVG */}
                             <div className="aspect-square rounded-[3rem] border border-theme glass-card relative p-12 flex items-center justify-center shadow-2xl">
                                <div className="absolute inset-0 bg-brand/5 rounded-[3rem] blur-3xl opacity-50"></div>
 
                                 {/* Central Hub */}
                                <div className="relative z-10 scale-125">
                                    <div className="w-48 h-48 rounded-full border border-brand/20 flex items-center justify-center relative animate-[spin_30s_linear_infinite]">
                                        <div className="w-1.5 h-1.5 bg-brand rounded-full absolute top-0 -translate-y-1/2 shadow-[0_0_10px_#10b981]"></div>
                                        <div className="w-1.5 h-1.5 bg-brand rounded-full absolute bottom-0 translate-y-1/2 shadow-[0_0_10px_#10b981]"></div>
                                    </div>
                                     <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <Globe size={56} className="text-brand mx-auto mb-3 opacity-80" strokeWidth={0.5} />
                                            <span className="text-primary-text font-black uppercase tracking-[0.4em] text-[10px]">India Hub</span>
                                        </div>
                                    </div>
 
                                    {/* Orbiting Nodes (Exports) */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] border border-theme rounded-full animate-[spin_45s_linear_infinite_reverse]">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 glass border border-brand/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            <div className="w-1.5 h-1.5 bg-brand rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Specialized Processes */}
            <section className="py-32 bg-bg-main transition-colors duration-300">
                <div className="container mx-auto px-6">
                     <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-border/5 pb-10">
                        <div>
                            <span className="text-brand uppercase tracking-[0.3em] text-[10px] font-black">Our Expertise</span>
                            <h2 className="text-4xl md:text-6xl font-serif text-primary-text mt-4 font-bold tracking-tight">Precision <span className="italic font-normal text-brand opacity-80">Manufacturing</span></h2>
                        </div>
                        <Link to="/about" className="text-brand-light hover:text-primary-text transition-all flex items-center gap-3 uppercase text-[10px] font-black tracking-[0.2em] mt-6 md:mt-0 glass px-6 py-3 rounded-full border-brand/20">
                            View All Capabilities <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                          {processes.map((process, index) => (
                            <div key={index} className="group relative h-48 border border-theme bg-bg-main rounded-3xl overflow-hidden hover:bg-brand/5 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-2 flex flex-col items-center justify-center p-6">
                                <div className="w-12 h-12 rounded-2xl bg-secondary border border-theme flex items-center justify-center text-secondary-text/30 mb-4 group-hover:border-brand/40 group-hover:text-brand transition-all duration-300">
                                    <CheckCircle size={20} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-[11px] font-black text-primary-text font-serif group-hover:text-brand transition-colors tracking-widest uppercase text-center leading-tight">{process}</h3>
                                <div className="absolute top-0 left-0 w-full h-1 bg-brand transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                            </div>
                        ))}
                        <div className="group relative h-48 border border-brand/20 bg-brand/5 rounded-3xl overflow-hidden hover:bg-brand/10 transition-all duration-500 flex items-center justify-center shadow-sm hover:shadow-xl hover:-translate-y-2">
                            <span className="text-brand font-black uppercase tracking-[0.3em] text-[9px] group-hover:scale-110 transition-transform cursor-pointer px-6 py-3 rounded-full border border-brand/10">
                                + Custom Solutions
                            </span>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
