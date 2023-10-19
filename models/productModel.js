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
    featured_product: {
        type: Boolean,
        default: false
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
    images: [
        {
            public_id: {
                type: String,
                required: true,
                default: "No image"
            },
            url: {
                type: String,
                required: true,
                default: "https://res.cloudinary.com/npvinh/image/upload/v1697730520/MyChildren/sgim0ngzkustrnwu2gq8.png"
            }
        }
    ],
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