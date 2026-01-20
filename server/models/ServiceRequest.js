import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    serviceType: {
        type: String,
        required: true,
        enum: [
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
            'Other'
        ]
    },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Resolved'],
        default: 'New'
    }
}, {
    timestamps: true
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
export default ServiceRequest;
