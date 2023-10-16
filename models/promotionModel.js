const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
        default: "Không có mô tả"
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    products: [
        {
            product_id: {
                type: String,
                required: true
            },
        }
    ],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
},
    {
        timestamps: true
    }
);

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
