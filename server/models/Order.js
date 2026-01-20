import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
            materialType: { type: String },
            type: { type: String, required: true }, // 'regular' or 'sample'
            customization: { type: String },
            relatedSampleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
            isRiskAccepted: { type: Boolean, default: false }
        },
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true, default: 'India' },
        phone: { type: String, required: true },
    },
    billingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true, default: 'India' },
        phone: { type: String, required: true },
    },
    trackingHistory: [{
        status: { type: String, required: true }, // e.g., 'Ordered', 'Packed', 'Shipped'
        location: { type: String },
        timestamp: { type: Date, default: Date.now },
        description: { type: String }
    }],
    paymentMethod: {
        type: String,
        required: true,
    },
    deliveryMethod: {
        type: String, // 'Courier' or 'Pickup'
        required: true,
        default: 'Courier'
    },
    trackingDetails: {
        provider: { type: String }, // e.g., 'FedEx', 'DTDC'
        trackingNumber: { type: String }
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    invoiceUrl: { type: String },
    invoiceDate: { type: Date }
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
