/**
 * seeder.js — Non-Destructive Data Seeder
 *
 * Safe to run at any time. Never deletes existing data.
 * Creates only the records that are missing from the database,
 * identified by a unique field (email for users, name for products).
 *
 * Usage:
 *   node seeder.js         → seed missing data
 *   node seeder.js -d      → print warning (no-op, delete is disabled)
 */

import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import colors from 'colors';
import Product from './models/Product.js';
import User from './models/User.js';

// DNS Resolution fix for MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

// ── DB Connection ────────────────────────────────────────────────────────────
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zain-fabrics');
        console.log('MongoDB Connected'.cyan.underline);
    } catch (error) {
        console.error(`DB Connection Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

// ── Seed Data ────────────────────────────────────────────────────────────────
const adminUser = {
    name: 'Admin User',
    email: 'admin@zain.com',
    password: 'password123',
    role: 'admin',
    phone: '9999999999',
    companyName: 'Zain Fabrics Internal'
};

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
        textureMaps: { map: '/3dmodel/cotton_texture.png' },
        samplePrice: 50,
        isAvailable: true
    },
    {
        name: 'EVA Polymer Coating',
        description: 'Advanced waterproof EVA polymer coating for outdoor and performance footwear.',
        materialType: 'COATINGS',
        pricePerMeter: 320,
        width: '58 inches',
        gsm: 200,
        inStock: 2500,
        imageUrl: '/products/coating.png',
        samplePrice: 50,
        isAvailable: true
    },
    {
        name: 'Soft Brush Raising Fabric',
        description: 'Terry-style raising fabric for superior inner comfort and breathability.',
        materialType: 'RAISING',
        pricePerMeter: 280,
        width: '60 inches',
        gsm: 180,
        inStock: 1500,
        imageUrl: '/products/raising.png',
        samplePrice: 50,
        isAvailable: true
    },
    {
        name: 'Heavy Duty Cotton Drill',
        description: 'Durable cotton drill for reinforcement and structural shoe layers.',
        materialType: 'DRILL',
        pricePerMeter: 210,
        width: '56 inches',
        gsm: 240,
        inStock: 3000,
        imageUrl: '/products/drill.png',
        samplePrice: 50,
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
        textureMaps: { map: '/3dmodel/jersey_texture.png' },
        samplePrice: 50,
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
        samplePrice: 50,
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
        textureMaps: { map: '/3dmodel/foam_texture.png' },
        samplePrice: 50,
        isAvailable: true
    },
    {
        name: 'Heat Bonded Adhesive Film',
        description: 'Heat bonded adhesive film with strong thermoplastic properties for firm layer bonding.',
        materialType: 'BONDING',
        pricePerMeter: 150,
        width: '48 inches',
        gsm: 80,
        inStock: 10000,
        imageUrl: '/products/bonding.png',
        samplePrice: 50,
        isAvailable: true
    },
    {
        name: 'Polyester Printed Lining',
        description: 'Sublimation-printed polyester lining fabric, ideal for branding and custom shoe interiors.',
        materialType: 'COATINGS',
        pricePerMeter: 270,
        width: '58 inches',
        gsm: 130,
        inStock: 3500,
        imageUrl: '/products/coating.png',
        textureMaps: { map: '/3dmodel/polyester_texture.png' },
        samplePrice: 50,
        isAvailable: true
    },
    {
        name: 'Warp Knit Jersey Mesh',
        description: 'Technical warp-knit jersey mesh for athletic shoe uppers with high air permeability.',
        materialType: 'JERSEY',
        pricePerMeter: 230,
        width: '62 inches',
        gsm: 100,
        inStock: 4000,
        imageUrl: '/products/jersey.png',
        textureMaps: { map: '/3dmodel/jersey_texture.png' },
        samplePrice: 50,
        isAvailable: true
    }
];

// ── Main Seeder ──────────────────────────────────────────────────────────────
const importData = async () => {
    await connectDB();
    
    let usersCreated = 0;
    let usersSkipped = 0;
    let productsCreated = 0;
    let productsUpdated = 0;

    try {
        // ── Users ────────────────────────────────────────────────────────────
        console.log('\n── Users ────────────────────────────────────────────'.gray);
        const adminExists = await User.findOne({ email: adminUser.email });
        if (!adminExists) {
            await User.create(adminUser);
            console.log(`  ✓ Created: ${adminUser.email}`.green);
            usersCreated++;
        } else {
            console.log(`  ↷ Exists:  ${adminUser.email}`.yellow);
            usersSkipped++;
        }

        // ── Products ─────────────────────────────────────────────────────────
        console.log('\n── Products ─────────────────────────────────────────'.gray);
        for (const product of products) {
            const existing = await Product.findOne({ name: product.name });
            if (!existing) {
                await Product.create(product);
                console.log(`  ✓ Created: ${product.name}`.green);
                productsCreated++;
            } else {
                // Update fields that may have changed (image, price, textureMaps, etc.)
                // but only overwrite non-critical fields — never overwrites user-set stock or availability
                await Product.updateOne(
                    { name: product.name },
                    {
                        $set: {
                            description: product.description,
                            imageUrl: product.imageUrl,
                            textureMaps: product.textureMaps,
                            samplePrice: product.samplePrice,
                            width: product.width,
                            gsm: product.gsm,
                        }
                    }
                );
                console.log(`  ↷ Updated: ${product.name}`.yellow);
                productsUpdated++;
            }
        }

        // ── Summary ──────────────────────────────────────────────────────────
        console.log('\n────────────────────────────────────────────────────'.gray);
        console.log(`  Users:    ${usersCreated} created, ${usersSkipped} already existed`.cyan);
        console.log(`  Products: ${productsCreated} created, ${productsUpdated} updated`.cyan);
        console.log('\n  ✅  Seed complete — no data was deleted.\n'.green.bold);

        process.exit(0);
    } catch (error) {
        console.error(`\n  ❌  Seed Error: ${error.message}`.red.bold);
        console.error(error);
        process.exit(1);
    }
};

// ── Safety Guard ─────────────────────────────────────────────────────────────
if (process.argv[2] === '-d') {
    console.log('\n  ⚠️  Destroy mode is DISABLED in this seeder.'.yellow.bold);
    console.log('  Data deletion has been deliberately removed to protect production data.'.yellow);
    console.log('  If you need to reset data, do so manually via MongoDB Atlas or compass.\n'.yellow);
    process.exit(0);
} else {
    importData();
}
