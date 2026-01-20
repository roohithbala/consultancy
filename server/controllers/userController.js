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
            gstNumber: user.gstNumber,
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
        user.gstNumber = req.body.gstNumber || user.gstNumber;
        user.phone = req.body.phone || user.phone;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            companyName: updatedUser.companyName,
            gstNumber: updatedUser.gstNumber,
            phone: updatedUser.phone,
            addresses: updatedUser.addresses,
            token: req.user.token, // Assuming we want to keep the same token or token logic handles it elsewhere
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
