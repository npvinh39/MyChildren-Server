const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    province: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    ward: {
        type: String,
        required: true
    },
    number_street: {
        type: String,
        required: true
    },
},
    {
        timestamps: true
    }
);

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
