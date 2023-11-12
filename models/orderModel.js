const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    code_order: {
        type: String,
        required: true
    },
    products: {
        type: Array,
        required: true
    },
    customer: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true
    },
    shipping: {
        type: Number,
        required: true
    },
    total_amount: {
        type: Number,
        required: true
    },
    final_total: {
        type: Number,
        required: true
    },
    payment_status: {
        type: String,
        required: true
    },
    payment_method: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "Chờ xác nhận"
    },
    delivery_method: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
