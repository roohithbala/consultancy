import { ShieldCheck, Users, Globe, Award } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-gray-900 text-white py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Excellence in Shoe Inlines</h1>
                <p className="text-xl max-w-2xl mx-auto text-gray-300">
                    Zain Fabrics: The premier choice for durable and aesthetic shoe lining materials.
                </p>
            </section>

            {/* Our Story */}
            <section className="py-16 container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <img
                            src="https://images.unsplash.com/photo-1563964295325-1e43c5f67b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Shoe Lining Factory Production"
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Zain Fabrics is a dedicated manufacturer specializing in **Zain Shoe Inline**. We provide high-quality shoe lining materials directly to major shoe manufacturers and exporters.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Located in the manufacturing hub of **Perundurai**, we handle the entire process from yarn to packing, ensuring complete quality control for our shoe lining/inline products.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                        <div className="h-1 w-20 bg-accent mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <ShieldCheck size={40} className="text-accent mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">Quality First</h3>
                            <p className="text-sm text-gray-500">Rigorous testing at every stage of production.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <Users size={40} className="text-accent mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">Customer Focus</h3>
                            <p className="text-sm text-gray-500">Tailored solutions to meet specific client needs.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <Globe size={40} className="text-accent mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">Global Reach</h3>
                            <p className="text-sm text-gray-500">Exporting to top markets in Europe and Asia.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <Award size={40} className="text-accent mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">Innovation</h3>
                            <p className="text-sm text-gray-500">Adopting latest tech like 3D visualization.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Certifications Section */}
            <section className="py-16 container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Certifications & Standards</h2>
                    <div className="h-1 w-20 bg-accent mx-auto mb-6"></div>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        We adhere to global quality and safety standards to ensure our materials are safe, durable, and eco-friendly.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-80 backdrop-grayscale">
                    {/* Placeholder content for Certifications - In real app, these would be logos */}
                    <div className="flex flex-col items-center gap-2 p-6 border rounded-lg hover:shadow-md transition-all bg-white w-full">
                        <Award size={48} className="text-accent" />
                        <span className="font-bold text-lg">ISO 9001:2015</span>
                        <span className="text-xs text-gray-500">Quality Management</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-6 border rounded-lg hover:shadow-md transition-all bg-white w-full">
                        <ShieldCheck size={48} className="text-green-600" />
                        <span className="font-bold text-lg">REACH</span>
                        <span className="text-xs text-gray-500">EU Compliance</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-6 border rounded-lg hover:shadow-md transition-all bg-white w-full">
                        <Award size={48} className="text-blue-600" />
                        <span className="font-bold text-lg">SATRA</span>
                        <span className="text-xs text-gray-500">Member</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-6 border rounded-lg hover:shadow-md transition-all bg-white w-full">
                        <Globe size={48} className="text-purple-600" />
                        <span className="font-bold text-lg">OEKO-TEX</span>
                        <span className="text-xs text-gray-500">Standard 100</span>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-gray-900 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Trusted by Industry Leaders</h2>
                        <div className="h-1 w-20 bg-accent mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: "Zain Fabrics has been our reliable partner for shoe linings for over 5 years. Their consistency in quality is unmatched.",
                                author: "Purchase Manager",
                                company: "KH Shoes, Ranipet"
                            },
                            {
                                quote: "The development team at Zain is fantastic. They helped us create a custom vamp lining that solved our breathability issues.",
                                author: "Director",
                                company: "NMZ Shoes, Ambur"
                            },
                            {
                                quote: "Timely delivery and professional documentation. One of the best suppliers in the Ambur cluster.",
                                author: "Head of Sourcing",
                                company: "Farida Group"
                            }
                        ].map((testimonial, idx) => (
                            <div key={idx} className="bg-gray-800 p-8 rounded-xl relative">
                                <div className="text-6xl text-accent absolute top-4 left-6 opacity-20">"</div>
                                <p className="text-gray-300 mb-6 relative z-10 italic leading-relaxed">
                                    "{testimonial.quote}"
                                </p>
                                <div>
                                    <h4 className="font-bold text-lg">{testimonial.author}</h4>
                                    <p className="text-accent text-sm">{testimonial.company}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
