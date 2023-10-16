const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: Object,
        required: true,
        default: "images/no-image.png"
    },
    description: {
        type: String,
        required: true,
        default: "description/no-description"
    },
},
    {
        timestamps: true
    }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
