import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    materialType: {
        type: String,
        required: true,
        enum: [
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
            'Dot Coating',
        ],
    },
    pricePerMeter: {
        type: Number,
        required: true,
        default: 0,
    },
    width: {
        type: String, // e.g. "60 inches"
    },
    gsm: {
        type: Number, // Grams per Square Meter
    },
    textureMaps: {
        map: { type: String }, // Base color
        normalMap: { type: String },
        roughnessMap: { type: String },
        ambientOcclusionMap: { type: String },
    },
    modelUrl: {
        type: String, // URL to .glb/.gltf file if custom model
    },
    certifications: {
        type: [String], // Array of strings for certification names
    },
    documents: [
        {
            name: { type: String, required: true },
            url: { type: String, required: true },
        }
    ],
    coatings: {
        type: [String],
        default: [],
    },
    samplePrice: {
        type: Number,
        default: 0, // 0 means free sample, or set a price
    },
    inStock: {
        type: Number,
        required: true,
        default: 0,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
export default Product;
