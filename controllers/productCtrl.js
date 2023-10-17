const Product = require('../models/productModel');
const Description = require('../models/descriptionModel');

const productCtrl = {
    getProducts: async (req, res) => {
        try {
            const products = await Product.find();
            res.json(products);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            res.json(product);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getProductByCategory: async (req, res) => {
        try {
            const products = await Product.find({ category_id: req.params.id });
            res.json(products);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    createProduct: async (req, res) => {
        try {
            const { product_id, name, category_id, stock, price, images, content } = req.body;

            // add the product
            const newProduct = new Product({
                product_id, name, category_id, stock, price, price_discount: price, images, content
            });

            // Save product to database
            await newProduct.save();

            // add the description
            const newDescription = new Description({
                product_id: newProduct._id
            });

            // Save description to database
            await newDescription.save();

            // Return success message
            res.json({ msg: "Created product Successfully!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateProduct: async (req, res) => {
        try {
            const { product_id, name, category_id, stock, price, price_discount, images, content, origin, made_in, brand, age_of_use } = req.body;

            // Update product
            await Product.findOneAndUpdate({ _id: req.params.id }, {
                product_id, name, category_id, stock, price, price_discount, images, content
            });

            // Update description
            await Description.findOneAndUpdate({ product_id: req.params.id }, {
                origin, made_in, brand, age_of_use
            });

            // Return success message
            res.json({ msg: "Updated product Successfully!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    deleteProduct: async (req, res) => {
        try {
            // Delete product
            await Product.findByIdAndDelete(req.params.id);

            // Delete description
            await Description.findOneAndDelete({ product_id: req.params.id });

            // Return success message
            res.json({ msg: "Deleted product Successfully!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = productCtrl;