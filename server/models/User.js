import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer',
    },
    companyName: { type: String },
    phone: { type: String },
    gstNo: { type: String },
    is2SVEnabled: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    addresses: [{
        addressType: { type: String, default: 'Home' },
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'India' },
        isDefault: { type: Boolean, default: false }
    }],
    // ── Credit Terms (B2B) ────────────────────────────────────────────────
    creditEnabled:   { type: Boolean, default: false },
    creditTermsDays: { type: Number, default: 0, enum: [0, 15, 30, 45, 60, 90] }, // Net-0 = immediate
    creditLimit:     { type: Number, default: 0 },   // Max outstanding balance (₹)
    creditNotes:     { type: String },               // Admin notes about this customer's credit arrangement
}, {
    timestamps: true,
});

userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
