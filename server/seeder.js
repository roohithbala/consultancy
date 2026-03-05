import 'dotenv/config';
import mongoose from 'mongoose';
import colors from 'colors';
import Product from './models/Product.js';
import User from './models/User.js';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zain-fabrics');
        console.log('MongoDB Connected'.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
};

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();

        await User.create({
            name: 'Admin User',
            email: 'admin@zain.com',
            password: 'password123',
            role: 'admin',
            phone: '9999999999',
            companyName: 'Zain Fabrics Internal'
        });

        const products = [
            {
                name: 'Premium Athletic Interlining',
                description: 'High-performance woven interlining designed for athletic footwear reinforcement. Features excellent bonding strength and dimensional stability.',
                materialType: 'INTERLININGS',
                pricePerMeter: 450,
                width: '60 inches',
                gsm: 120,
                inStock: 5000,
                imageUrl: '/products/interlining.png',
                textureMaps: {
                    map: '/3dmodel/cotton_texture.png'
                },
                isAvailable: true
            },
            {
                name: 'EVA Polymer Coating',
                description: 'Advanced waterproof coating for outdoor and performance footwear.',
                materialType: 'COATINGS',
                pricePerMeter: 320,
                width: '58 inches',
                gsm: 200,
                inStock: 2500,
                imageUrl: '/products/coating.png',
                isAvailable: true
            },
            {
                name: 'Soft Brush Raising Fabric',
                description: 'Terry-style raising fabric for superior inner comfort.',
                materialType: 'RAISING',
                pricePerMeter: 280,
                width: '60 inches',
                gsm: 180,
                inStock: 1500,
                imageUrl: '/products/raising.png',
                isAvailable: true
            },
            {
                name: 'Heavy Duty Cotton Drill',
                description: 'Durable cotton drill for reinforcement and structural layers.',
                materialType: 'DRILL',
                pricePerMeter: 210,
                width: '56 inches',
                gsm: 240,
                inStock: 3000,
                imageUrl: '/products/drill.png',
                isAvailable: true
            },
            {
                name: 'Breathable Shoe Jersey',
                description: 'Elastic and soft jersey knit for tongue and collar padding.',
                materialType: 'JERSEY',
                pricePerMeter: 190,
                width: '60 inches',
                gsm: 150,
                inStock: 2000,
                imageUrl: '/products/jersey.png',
                textureMaps: {
                    map: '/3dmodel/jersey_texture.png'
                },
                isAvailable: true
            },
            {
                name: 'Rugged Canvas 10oz',
                description: 'Industrial grade canvas for casual and protective footwear uppers.',
                materialType: 'CANVAS',
                pricePerMeter: 340,
                width: '54 inches',
                gsm: 310,
                inStock: 1200,
                imageUrl: '/products/canvas.png',
                isAvailable: true
            },
            {
                name: 'Laminated Foam Comfort XL',
                description: 'High-density foam laminated with polyester mesh for ultimate cushioning.',
                materialType: 'FOAM LAMINATIONS',
                pricePerMeter: 550,
                width: '58 inches',
                gsm: 400,
                inStock: 800,
                imageUrl: '/products/foam.png',
                textureMaps: {
                    map: '/3dmodel/foam_texture.png'
                },
                isAvailable: true
            },
            {
                name: 'Heat Bonded Adhesive Film',
                description: 'Strong thermoplastic bonding film for seamless construction.',
                materialType: 'BONDING',
                pricePerMeter: 150,
                width: '48 inches',
                gsm: 80,
                inStock: 10000,
                imageUrl: '/products/bonding.png',
                isAvailable: true
            }
        ];

        await Product.insertMany(products);

        console.log('Data Imported Successfully!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany(); // Be careful, this deletes all users!

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
