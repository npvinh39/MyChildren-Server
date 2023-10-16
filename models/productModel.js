const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        min: 3,
        max: 100,
        trim: true
    },
    category_id: {
        type: String,
        required: true,
        default: "Others"
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    sold: {
        type: Number,
        required: true,
        default: 0
    },
    price: {
        type: Number,
        required: true,
        trim: true,
    },
    price_discount: {
        type: Number,
        default: 0
    },
    images: {
        type: Array,
        default: []
    },
    content: {
        type: String,
        required: true,
        min: 10,
        max: 100000,
        default: "Chưa có thông tin"
    },
    // createdBy: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Admin',
    //     required: true
    // },

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;