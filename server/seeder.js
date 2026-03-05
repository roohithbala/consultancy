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
                imageUrl: 'https://media.istockphoto.com/id/1198271727/photo/dark-black-fabric-texture-background-linen.jpg?s=612x612&w=0&k=20&c=d3J_Pds_OaYn3kRzB_C2wB4c7Kz_C4d8y5y_Z8x_Z8x=',
                textureMaps: {
                    map: '/3dmodel/cotton_texture.png'
                }
            },
            {
                name: 'EVA Polymer Coating',
                description: 'Advanced waterproof coating for outdoor and performance footwear.',
                materialType: 'COATINGS',
                pricePerMeter: 320,
                width: '58 inches',
                gsm: 200,
                inStock: 2500,
                imageUrl: 'https://images.unsplash.com/photo-1598048145816-43574163991c?q=80&w=2000&auto=format&fit=crop'
            },
            {
                name: 'Soft Brush Raising Fabric',
                description: 'Terry-style raising fabric for superior inner comfort.',
                materialType: 'RAISING',
                pricePerMeter: 280,
                width: '60 inches',
                gsm: 180,
                inStock: 1500,
                imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2000&auto=format&fit=crop'
            },
            {
                name: 'Heavy Duty Cotton Drill',
                description: 'Durable cotton drill for reinforcement and structural layers.',
                materialType: 'DRILL',
                pricePerMeter: 210,
                width: '56 inches',
                gsm: 240,
                inStock: 3000,
                imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2000&auto=format&fit=crop'
            },
            {
                name: 'Breathable Shoe Jersey',
                description: 'Elastic and soft jersey knit for tongue and collar padding.',
                materialType: 'JERSEY',
                pricePerMeter: 190,
                width: '60 inches',
                gsm: 150,
                inStock: 2000,
                imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000&auto=format&fit=crop'
            },
            {
                name: 'Rugged Canvas 10oz',
                description: 'Industrial grade canvas for casual and protective footwear uppers.',
                materialType: 'CANVAS',
                pricePerMeter: 340,
                width: '54 inches',
                gsm: 310,
                inStock: 1200,
                imageUrl: 'https://images.unsplash.com/photo-1590674899484-d564ec188eff?q=80&w=2000&auto=format&fit=crop'
            },
            {
                name: 'Laminated Foam Comfort XL',
                description: 'High-density foam laminated with polyester mesh for ultimate cushioning.',
                materialType: 'FOAM LAMINATIONS',
                pricePerMeter: 550,
                width: '58 inches',
                gsm: 400,
                inStock: 800,
                imageUrl: 'https://images.unsplash.com/photo-1589415412852-c827361543ea?q=80&w=2000&auto=format&fit=crop'
            },
            {
                name: 'Heat Bonded Adhesive Film',
                description: 'Strong thermoplastic bonding film for seamless construction.',
                materialType: 'BONDING',
                pricePerMeter: 150,
                width: '48 inches',
                gsm: 80,
                inStock: 10000,
                imageUrl: 'https://images.unsplash.com/photo-1597484661643-2f5fef600dd2?q=80&w=2000&auto=format&fit=crop'
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
