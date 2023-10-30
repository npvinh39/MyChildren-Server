const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true //important
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending'
    }
},
    {
        timestamps: true //important
    }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
