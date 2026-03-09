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
        sparse: true, // Only exists for Google users
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer',
    },
    companyName: {
        type: String, // Optional, for enterprise
    },
    phone: {
        type: String,
    },
    gstNo: {
        type: String, // Optional
    },
    is2SVEnabled: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    addresses: [{
        addressType: { type: String, default: 'Home' }, // Home, Work, etc.
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'India' },
        isDefault: { type: Boolean, default: false }
    }]
}, {
    timestamps: true,
});

// Password Hash Middleware
userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare Password Interface
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
