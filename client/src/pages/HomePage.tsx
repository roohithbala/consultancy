import { ArrowRight, MapPin, Globe, CheckCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const HomePage = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    // If logged in, redirect to the shopping experience (Products Page)
    if (user) {
        return <Navigate to="/products" replace />;
    }

    const exports = [
        { name: 'KH Shoes', location: 'Ranipet' },
        { name: 'NMZ Shoes', location: 'Ambur' },
        { name: 'NMH Shoes', location: 'Ambur' },
        { name: 'ISPL', location: 'Chennai' },
        { name: 'Kenmore Shoes', location: 'Chennai' },
        { name: 'Excellent Shoes', location: 'Ambur' },
        { name: 'Mohib Shoes', location: 'Ambur' },
        { name: 'Calidas', location: 'Ambur' },
        { name: 'Gobi Shoes', location: 'Ambur' },
        { name: 'SNS Clothing', location: 'Ambur - Local India Selling' },
    ];

    const processes = [
        'Yarn purchase',
        'Knitting jobwork',
        'Dyeing jobwork',
        'Fusing',
        'Polyester printed jobwork',
        'Sizing',
        'Weaving',
        'Dye with wash',
        'Coating Evea Polymered',
        'Foam, with bageer, without fabric Dot coating',
        'Packing',
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-50">
                    {/* Placeholder for Hero Video/Image */}
                    <div className="w-full h-full bg-gradient-to-r from-black to-gray-800"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        Zain Shoe <span className="text-accent">Inline</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-200">
                        Premier manufacturer of high-quality shoe linings and materials.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <Link to="/products" className="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition-all flex items-center gap-2">
                            Explore Materials <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="py-20 container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Specialized Shoe Materials</h2>
                    <div className="h-1 w-20 bg-accent mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold mb-3">Durable Linings</h3>
                        <p className="text-gray-600">Engineered for comfort and longevity in footwear applications.</p>
                    </div>
                    {/* Feature 2 */}
                    <div className="p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold mb-3">3D Texture View</h3>
                        <p className="text-gray-600">Inspect material grain and finish with our interactive viewer.</p>
                    </div>
                    {/* Feature 3 */}
                    <div className="p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold mb-3">Industry Standard</h3>
                        <p className="text-gray-600">Supplying to top export houses in Perundurai, Ambur, and Ranipet.</p>
                    </div>
                </div>
            </section>

            {/* Manufacturing & Partners Section - Merged from Zain Shoe Inline */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {/* Export Partners */}
                        <div>
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                <Globe className="text-accent" /> Trusted Partners
                            </h2>
                            <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                                <ul className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                                    {exports.map((partner, index) => (
                                        <li key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <span className="font-medium text-gray-800">{partner.name}</span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <MapPin size={14} /> {partner.location}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Manufacturing Process */}
                        <div>
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                <CheckCircle className="text-accent" /> End-to-End Process
                            </h2>
                            <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-lg">
                                <ul className="space-y-4">
                                    {processes.map((process, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="min-w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold mt-0.5">
                                                {index + 1}
                                            </div>
                                            <span className="text-gray-700">{process}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
