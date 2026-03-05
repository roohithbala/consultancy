import Settings from '../models/Settings.js';

// @desc    Get system settings (create default if not exists)
// @route   GET /api/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
    let settings = await Settings.findOne();

    if (!settings) {
        settings = await Settings.create({});
    }

    res.json(settings);
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
    let settings = await Settings.findOne();

    if (!settings) {
        settings = await Settings.create({});
    }

    settings.razorpay = req.body.razorpay !== undefined ? req.body.razorpay : settings.razorpay;
    settings.bankTransfer = req.body.bankTransfer !== undefined ? req.body.bankTransfer : settings.bankTransfer;
    settings.emailNotifications = req.body.emailNotifications !== undefined ? req.body.emailNotifications : settings.emailNotifications;
    settings.smsNotifications = req.body.smsNotifications !== undefined ? req.body.smsNotifications : settings.smsNotifications;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
};
