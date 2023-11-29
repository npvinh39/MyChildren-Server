const Product = require('../models/productModel');
const Description = require('../models/descriptionModel');
const APIFeatures = require('../utils/apiFeatures');


const productCtrl = {
    getProducts: async (req, res) => {
        try {
            const features = new APIFeatures(Product.find(), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();

            const products = await features.query;

            res.json({
                status: 'success',
                results: products.length,
                totalPages: Math.ceil(await Product.countDocuments().exec() / req.query.limit),
                data: {
                    products
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getProductsWithDescription: async (req, res) => {
        try {
            const features = new APIFeatures(Product.find(), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();


            const products = await features.query;

            const result = await Promise.all(products.map(async product => {
                const description = await Description.findOne({ product_id: product._id });
                return {
                    ...product.toObject(),
                    description: description.toObject()
                };
            })
            );

            res.json({
                status: 'success',
                results: result.length,
                totalPages: Math.ceil(await Product.countDocuments().exec() / req.query.limit),
                data: {
                    products: result
                }
            });
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

            if (req.params.id === 'all') {
                const features = new APIFeatures(Product.find(), req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate();


                const products = await features.query;

                res.json({
                    status: 'success',
                    results: products.length,
                    totalPages: Math.ceil(await Product.countDocuments().exec() / req.query.limit),
                    products
                });
            }
            else {
                const features = new APIFeatures(Product.find({ category_id: req.params.id }), req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate();


                const products = await features.query;

                res.json({
                    status: 'success',
                    results: products.length,
                    totalPages: Math.ceil(await Product.countDocuments().exec() / req.query.limit),
                    products
                });
            }

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getProductsLength: async (req, res) => {
        try {
            const productsLength = await Product.countDocuments();
            res.json({ length: productsLength });
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
            const { product_id, name, category_id, stock, price, price_discount, featured_product, images, content, origin, made_in, brand, age_of_use } = req.body;

            // Update product
            await Product.findOneAndUpdate({ _id: req.params.id }, {
                product_id, name, category_id, stock, price, price_discount, featured_product, images, content
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