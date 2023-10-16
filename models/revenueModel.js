const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    total_price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
},
    {
        timestamps: true
    }
);

const Revenue = mongoose.model('Revenue', revenueSchema);

module.exports = Revenue;
