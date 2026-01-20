import mongoose from 'mongoose';

const settingsSchema = mongoose.Schema({
    billDesk: { type: Boolean, default: true },
    bankTransfer: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
