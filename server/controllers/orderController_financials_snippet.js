export const updateOrderFinancials = async (req, res) => {
    const { orderItems, shippingPrice } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        // Update Order Items Price
        if (orderItems && orderItems.length > 0) {
            order.orderItems.forEach(item => {
                const updatedItem = orderItems.find(i => i._id.toString() === item._id.toString());
                if (updatedItem) {
                    item.price = Number(updatedItem.price);
                }
            });
        }

        // Update Shipping
        if (shippingPrice !== undefined) {
            order.shippingPrice = Number(shippingPrice);
        }

        // Recalculate Totals
        order.itemsPrice = order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        // 18% Tax (Standard)
        order.taxPrice = order.itemsPrice * 0.18;

        // Total
        order.totalPrice = order.itemsPrice + order.taxPrice + order.shippingPrice;

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};
