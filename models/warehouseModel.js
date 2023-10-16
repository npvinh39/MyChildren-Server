const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({

    products: [
        {
            product_id: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    type: {
        type: String,
        required: true,
        default: "Nhập"
    },
    importDate: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    }
);

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;
