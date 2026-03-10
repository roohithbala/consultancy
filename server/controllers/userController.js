import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyName: user.companyName,
            gstNo: user.gstNo,
            phone: user.phone,
            addresses: user.addresses,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.companyName = req.body.companyName || user.companyName;
        user.gstNo = req.body.gstNo || user.gstNo;
        user.phone = req.body.phone || user.phone;

        if (req.body.is2SVEnabled !== undefined) {
            user.is2SVEnabled = req.body.is2SVEnabled;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        // Pass the token back - either from the current request or a fresh one
        const token = req.headers.authorization.split(' ')[1];

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            companyName: updatedUser.companyName,
            gstNo: updatedUser.gstNo,
            phone: updatedUser.phone,
            addresses: updatedUser.addresses,
            is2SVEnabled: updatedUser.is2SVEnabled,
            token: token,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Add address
// @route   POST /api/users/address
// @access  Private
export const addAddress = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { addressType, street, city, postalCode, country, isDefault } = req.body;

        const newAddress = {
            addressType,
            street,
            city,
            postalCode,
            country,
            isDefault
        };

        // If this new address is set to default, unset others
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(newAddress);
        const updatedUser = await user.save();
        res.json(updatedUser.addresses);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Delete address
// @route   DELETE /api/users/address/:id
// @access  Private
export const deleteAddress = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
        const updatedUser = await user.save();
        res.json(updatedUser.addresses);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
};

// @desc    Send email to user
// @route   POST /api/users/:id/email
// @access  Private/Admin
export const sendUserEmail = async (req, res) => {
    const user = await User.findById(req.params.id);
    const { subject, message } = req.body;

    if (user) {
        try {
            const { sendEmail, getAdminCustomEmailHtml } = await import('../utils/sendEmail.js');
            await sendEmail(
                user.email, 
                subject, 
                message, 
                [], 
                getAdminCustomEmailHtml(user.name, subject, message)
            );
            res.json({ message: 'Email sent successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error sending email', error: error.message });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
