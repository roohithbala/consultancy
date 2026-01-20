// Add updatePaymentStatus function to orderController.js
// Append this at the end before the last closing brace

// @desc    Update Payment Status (Admin)
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
export const updatePaymentStatus = async (req, res) => {
    const { isPaid } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = isPaid;
        if (isPaid && !order.paidAt) {
            order.paidAt = Date.now();
        }
        // If marking as unpaid, clear paidAt
        if (!isPaid) {
            order.paidAt = undefined;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};
