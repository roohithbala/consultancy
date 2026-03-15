import { ArrowRight, Globe, Play } from 'lucide-react';
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
        { name: 'COATINGS',          img: '/capabilities/capability_coatings_1773046543066.png', fallback: 'https://images.unsplash.com/photo-1558444479-c749ddb1b55a?auto=format&fit=crop&q=80&w=800' },
        { name: 'INTERLININGS',      img: '/capabilities/capability_interlinings_1773046559078.png', fallback: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=800' },
        { name: 'RAISING',           img: '/capabilities/capability_raising_1773046577665.png', fallback: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800' },
        { name: 'DRILL',             img: '/capabilities/capability_drill_1773046598374.png', fallback: 'https://images.unsplash.com/photo-1582733986280-48ef01859e86?auto=format&fit=crop&q=80&w=800' },
        { name: 'JERSEY',            img: '/capabilities/capability_jersey_1773046618140.png', fallback: 'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?auto=format&fit=crop&q=80&w=800' },
        { name: 'CANVAS',            img: '/capabilities/capability_canvas_1773046633864.png', fallback: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800' },
        { name: 'BONDING',           img: '/capabilities/capability_bonding_1773046650713.png', fallback: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800' },
        { name: 'FOAM LAMINATIONS',  img: '/capabilities/capability_foam_lamination_1773046667501.png', fallback: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
        { name: 'Advanced Fusing',   img: '/capabilities/capability_advanced_fusing_1773046697258.png', fallback: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800' },
        { name: 'Polyester Printing',img: '/capabilities/capability_polyester_printing_1773046713786.png', fallback: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800' },
        { name: 'Precision Sizing',  img: '/capabilities/capability_precision_sizing_1773046730630.png', fallback: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800' },
        { name: 'Premium Weaving',   img: '/capabilities/capability_premium_weaving_1773046747739.png', fallback: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800' },
        { name: 'Dye & Wash',        img: '/capabilities/capability_dye_wash_1773046766236.png', fallback: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&q=80&w=800' },
        { name: 'Eva Polymer Coating', img: '/capabilities/capability_eva_coating_1773046781092.png', fallback: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&q=80&w=800' },
        { name: 'Dot Coating',       img: '', fallback: 'https://images.unsplash.com/photo-1517373116369-9bdb8cc51630?auto=format&fit=crop&q=80&w=800' },
    ];

    return (
        <div className="bg-bg-main text-primary-text font-sans selection:bg-brand/30 selection:text-brand scroll-smooth transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black text-white">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=2000" 
                        alt="Premium Shoe Materials Background" 
                        className="w-full h-full object-cover opacity-60"
                        onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=2000";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90 z-10"></div>
                    
                    {/* Technical Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px] z-20 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,#000_20%,transparent_100%)]"></div>
                </div>

                <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 border border-white/20 px-5 py-2.5 rounded-full mb-8 bg-white/5 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse"></span>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-black">ESTD 2014</span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black mb-10 leading-[0.95] tracking-tighter text-white">
                        Material <br /> <span className="text-brand italic font-normal pr-4">Excellence</span>
                    </h1>

                    <p className="text-lg md:text-xl mb-12 text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
                        Engineered shoe materials for the world's leading brands.<br />
                        Defining quality on the <span className="text-brand font-bold border-b border-brand pb-0.5">Global Stage</span>.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-5">
                        <Link to="/products" className="group relative px-12 py-5 bg-brand text-black font-black uppercase tracking-[0.25em] text-[10px] overflow-hidden transition-all hover:scale-105 active:scale-95 rounded-full shadow-2xl shadow-brand/30">
                            <span className="relative z-10 flex items-center gap-3">
                                Explore Collection <ArrowRight size={16} strokeWidth={3} />
                            </span>
                            <div className="absolute inset-0 bg-white/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out origin-left"></div>
                        </Link>

                        <Link to="/contact" className="group px-10 py-5 border border-white/25 text-white/80 font-black uppercase tracking-[0.25em] text-[10px] hover:border-brand hover:text-brand transition-all flex items-center gap-3 rounded-full backdrop-blur-sm bg-white/5">
                            <Play size={14} className="fill-current" strokeWidth={3} /> Our Story
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent animate-pulse"></div>
                    <span className="text-white/30 text-[9px] uppercase tracking-[0.4em]">Scroll</span>
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

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {processes.map((process, index) => (
                            <div key={index} className="group relative h-52 rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-md hover:shadow-2xl cursor-pointer">
                                {/* Background Image with Primary/Fallback Logic */}
                                <img
                                    src={process.img || process.fallback}
                                    alt={process.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => {
                                        if (e.currentTarget.src !== process.fallback) {
                                            e.currentTarget.src = process.fallback;
                                        }
                                    }}
                                />
                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />
                                {/* Green top border on hover */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-brand transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                {/* Label */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="text-[11px] font-black text-white tracking-widest uppercase leading-tight drop-shadow-lg">{process.name}</h3>
                                </div>
                            </div>
                        ))}

                        <div className="group relative h-52 border border-brand/20 bg-brand/5 rounded-2xl overflow-hidden hover:bg-brand/10 transition-all duration-500 flex items-center justify-center shadow-sm hover:shadow-xl hover:-translate-y-2">
                            <span className="text-brand font-black uppercase tracking-[0.3em] text-[9px] group-hover:scale-110 transition-transform cursor-pointer px-6 py-3 rounded-full border border-brand/10 text-center">
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
