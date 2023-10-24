const Product = require('../models/productModel');
const Description = require('../models/descriptionModel');

const productCtrl = {
    getProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const results = {};

            if (endIndex < await Product.countDocuments().exec()) {
                results.next = {
                    page: page + 1,
                    limit: limit
                }
            }

            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                }
            }

            results.results = await Product.find().limit(limit).skip(startIndex).exec();
            res.json(results);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getProductsWithDescription: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const results = {};

            if (endIndex < await Product.countDocuments().exec()) {
                results.next = {
                    page: page + 1,
                    limit: limit
                }
            }

            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                }
            }

            const products = await Product.find().limit(limit).skip(startIndex).exec();
            const descriptions = await Description.find().limit(limit).skip(startIndex).exec();

            const result = products.map((product, index) => {
                return {
                    ...product.toObject(),
                    description: descriptions[index].toObject()
                }
            });

            results.totalPages = Math.ceil(await Product.countDocuments().exec() / limit);

            results.results = result;
            res.json(results);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            const description = await Description.findOne({ product_id: req.params.id });
            const result = {
                ...product.toObject(),
                description: description.toObject()
            };

            res.json(result);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getDescriptionByProduct: async (req, res) => {
        try {
            const description = await Description.findOne({ product_id: req.params.id });
            res.json(description);
        }
        catch (err) {
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
            const { product_id, name, category_id, stock, price, images, content, origin, made_in, brand, age_of_use } = req.body;

            // add the product
            const newProduct = new Product({
                product_id, name, category_id, stock, price, price_discount: price, images, content, origin, made_in, brand, age_of_use
            });

            // Save product to database
            await newProduct.save();

            // add the description
            const newDescription = new Description({
                product_id: newProduct._id,
                origin, made_in, brand, age_of_use
            });

            // Save description to database
            await newDescription.save();

            const product = await getProduct(newProduct._id);

            // Return success message
            res.json({ msg: "Created product Successfully!", data: product });
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

            // const product = await Product.findById(req.params.id);
            const product = await getProduct(req.params.id);

            // Return success message
            res.json({ msg: "Updated product Successfully!", data: product });
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
            res.json({ msg: "Deleted product Successfully!", _id: req.params.id });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

async function getProduct(id) {
    try {
        const product = await Product.findById(id);
        const description = await Description.findOne({ product_id: id });
        const result = {
            ...product.toObject(),
            description: description.toObject()
        };

        return result;
    } catch (err) {
        return err.message;
    }
}

module.exports = productCtrl;