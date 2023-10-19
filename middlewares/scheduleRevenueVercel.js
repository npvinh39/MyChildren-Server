const Revenue = require('../models/revenueModel');
const Order = require('../models/orderModel');

export const updateRevenue = async () => {
    try {
        const orders = await Order.find();
        // const revenues = await Revenue.find();

        const today = new Date();
        const yesterday = new Date(today.setDate(today.getDate() - 1));

        let total_price = 0;
        let quantity = 0;

        // Calculate total_price and quantity of yesterday
        // If it doesn't sell that day, total_price and quantity will be 0
        orders.forEach(order => {
            if (order.createdAt >= yesterday && order.createdAt < today) {
                total_price += order.total_price;
                quantity += order.quantity;
            }
        });

        const revenue = new Revenue({
            total_price: total_price,
            quantity: quantity
        });

        await revenue.save();
    } catch (err) {
        console.log(err);
    }
}