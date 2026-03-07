import { FileText, AlertTriangle, Truck, RotateCcw, CheckCircle, Info } from 'lucide-react';

const TermsPage = () => {
    return (
        <div className="bg-bg-main min-h-screen pt-32 pb-20 text-primary-text font-sans transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <div className="mb-20 text-center">
                    <span className="text-brand text-[10px] font-black tracking-[0.4em] uppercase mb-4 block animate-fade-in">Manufacturing Agreement</span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter animate-fade-in">
                        Terms of <span className="italic font-normal opacity-60 text-secondary-text">Service</span>
                    </h1>
                    <p className="text-secondary-text text-lg font-light leading-relaxed max-w-2xl mx-auto">
                        High-performance partnership requires mutual clarity. 
                        Review the technical and commercial standards of Zain Fabrics.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Section 1: Ordering Standards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <section className="md:col-span-2 bg-bg-alt/30 border border-border/10 p-10 rounded-[2.5rem] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-brand/10 rounded-xl text-brand">
                                        <CheckCircle size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight">Ordering Standards</h2>
                                </div>
                                <div className="space-y-6 text-secondary-text leading-relaxed font-light">
                                    <p>
                                        All fabric orders are subject to a **minimum order quantity (MOQ) of 5 linear meters**. 
                                        This ensures manufacturing consistency and optimal shipping economics.
                                    </p>
                                    <p>
                                        Bulk production requirements exceeding 500 meters are subject to separate timeline negotiations 
                                        and custom dye-lot matching protocols.
                                    </p>
                                </div>
                            </div>
                        </section>
                        
                        <section className="bg-brand text-black p-10 rounded-[2.5rem] flex flex-col justify-between shadow-[0_20px_40px_rgba(16,185,129,0.2)]">
                            <Info size={32} strokeWidth={2.5} />
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Sample Protocol</h3>
                                <p className="text-sm font-bold leading-relaxed">
                                    Bulk orders without a verified Sample ID are processed under the "Unverified Order Warning" protocol. 
                                    Returns are not accepted for unverified color/texture discrepancies.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Section 2: Logistics & Liability */}
                    <section className="bg-bg-alt/50 border border-border/10 p-10 rounded-[2.5rem]">
                        <div className="flex items-start gap-8 mb-10">
                            <Truck size={32} className="text-brand shrink-0" />
                            <h2 className="text-3xl font-bold tracking-tight">Global Logistics & Liability</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-brand">Shipping Timelines</h4>
                                <p className="text-secondary-text text-sm font-light leading-relaxed">
                                    Standard domestic delivery (India) ranges from 2-4 business days. 
                                    International exports (Vietnam, Italy, Vietnam) are subject to customs clearance and typically ship via air freight in 5-8 business days.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-brand">Risk of Loss</h4>
                                <p className="text-secondary-text text-sm font-light leading-relaxed">
                                    Liability transfers to the buyer upon hand-off to the designated Zenith logistics carrier. 
                                    Comprehensive transit insurance is available upon request for premium material grades.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Returns & Quality Assurance */}
                    <section className="bg-bg-main border border-border/10 p-10 rounded-[2.5rem] border-l-4 border-l-red-500/50">
                        <div className="flex items-center gap-6 mb-8">
                            <RotateCcw className="text-red-500" size={24} />
                            <h2 className="text-2xl font-bold tracking-tight">Manufacturing Returns</h2>
                        </div>
                        <div className="space-y-6 text-secondary-text leading-relaxed font-light">
                            <p>
                                Fabric is a raw material that is cut or processed upon receipt. Once a material has been cut, washed, 
                                or altered from its original factory-rolled state, it is strictly **non-returnable**.
                            </p>
                            <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10 flex items-start gap-4">
                                <AlertTriangle className="text-red-500 shrink-0" size={18} />
                                <span className="text-xs leading-relaxed italic">
                                    Returns for manufacturing defects must be initiated within 72 hours of delivery and prior to any industrial processing.
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Footer Contact */}
                    <div className="pt-20 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary-text/30">Last Updated: March 2026</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary-text/30">Zain Fabrics Legal Division</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="p-4 bg-bg-alt border border-border/10 rounded-full flex items-center justify-center">
                                <FileText size={20} className="text-brand" />
                            </div>
                            <button className="bg-white text-black px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-brand transition-colors">
                                Download PDF Version
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
