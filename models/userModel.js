const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    last_name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    first_name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    spending: {
        type: Number,
        required: true,
        default: 0
    },
    default_address: {
        type: String,
        required: true,
        default: "Chưa có thông tin"
    },
    address_id: {
        type: Array,
        required: true,
        default: []
    },
    role: {
        type: String,
        required: true,
        default: "user"
    },
},
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
