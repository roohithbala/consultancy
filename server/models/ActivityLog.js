import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null for guest activities or non-auth actions
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN', 
            'LOGOUT', 
            'REGISTER', 
            'PROFILE_UPDATE', 
            'ORDER_CREATED', 
            'ORDER_STATUS_UPDATE', 
            'ITEM_ADDED_TO_CART',
            '3D_MODEL_INTERACTION',
            'CONTACT_FORM_SUBMISSION',
            'PRODUCT_VIEW',
            'SAMPLES_REQUEST'
        ]
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    },
    path: {
        type: String
    },
    method: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries on analytics
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ action: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
