const mongoose = require('mongoose');

const descriptionSchema = new mongoose.Schema({
    product_id: {
        type: String,
        required: true
    },
    origin: {
        type: String,
        required: true,
        default: "Chưa có thông tin"
    },
    made_in: {
        type: String,
        required: true,
        default: "Chưa có thông tin"
    },
    brand: {
        type: String,
        required: true,
        default: "Chưa có thông tin"
    },
    age_of_use: {
        type: String,
        required: true,
        default: "Chưa có thông tin"
    },
},
    {
        timestamps: true
    }
);

const Description = mongoose.model('Description', descriptionSchema);

module.exports = Description;