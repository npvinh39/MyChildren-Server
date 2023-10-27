// Warehouse use to update stock of a product and save it to database
const Warehouse = require('../models/warehouseModel');
const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');

const warehouseCtrl = {
    getWarehouseEntries: async (req, res) => {
        try {
            const features = new APIFeatures(Warehouse.find(), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();

            const warehouseEntries = await features.query;

            res.json({
                status: 'success',
                result: warehouseEntries.length,
                totalPages: Math.ceil(await Warehouse.countDocuments().exec() / req.query.limit),
                warehouses: warehouseEntries
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    updateProductStockIn: async (req, res) => {
        try {
            const { products } = req.body;

            // If the product doesn't exist, return an error
            if (!products) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Find the product by ID
            for (let i = 0; i < products.length; i++) {
                const product = await Product.findById(products[i].product_id);

                // Update the product's stock
                product.stock += products[i].quantity;

                // Save the updated product to the database
                await product.save();
            }

            // Create a new warehouse entry
            const warehouseEntry = new Warehouse({
                products,
                type: 'Nhập'
            });

            // Save the warehouse entry to the database
            await warehouseEntry.save();

            // Return the updated product
            res.json({ msg: "Updated warehouse successfully", products });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    },
    updateProductStockOut: async (req, res) => {
        try {
            const { products } = req.body;

            // If the product doesn't exist, return an error
            if (!products) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Find the product by ID
            for (let i = 0; i < products.length; i++) {
                const product = await Product.findById(products[i].product_id);

                if (product.stock < products[i].quantity) {
                    return res.status(404).json({ error: 'Product out of stock' });
                }
                // Update the product's stock
                product.stock -= products[i].quantity;

                // Save the updated product to the database
                await product.save();
            }

            // Create a new warehouse entry
            const warehouseEntry = new Warehouse({
                products,
                type: 'Xuất'
            });

            // Save the warehouse entry to the database
            await warehouseEntry.save();

            // Return the updated product
            res.json({ msg: "Updated warehouse successfully", products });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = warehouseCtrl;
