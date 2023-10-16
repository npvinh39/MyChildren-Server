const mongoose = require('mongoose');

const ratedSchema = new mongoose.Schema({
    product_id: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
);

const Rated = mongoose.model('Rated', ratedSchema);

module.exports = Rated;
