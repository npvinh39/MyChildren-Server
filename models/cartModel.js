const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    products: [{
        product_id: {
            type: String,
            required: true,
            default: null,
        },
        quantity: {
            type: Number,
            required: true,
            default: 0
        }
    }],
    total_price: {
        type: Number,
        required: true,
        default: 0
    },
},
    {
        timestamps: true
    }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
