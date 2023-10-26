const Promotion = require('../models/promotionModel');
const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');

const promotionCtrl = {
    getPromotions: async (req, res) => {
        try {
            const features = new APIFeatures(Promotion.find(), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();

            const promotions = await features.query;

            res.json({
                status: 'success',
                results: promotions.length,
                totalPages: Math.ceil(await Promotion.countDocuments().exec() / req.query.limit),
                data: {
                    promotions
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getPromotion: async (req, res) => {
        try {
            const promotion = await Promotion.findById(req.params.id);
            res.json(promotion);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    createPromotion: async (req, res) => {
        try {
            const { name, description, discount, products, startDate, endDate } = req.body;

            // Check if promotion name already exists
            const promotion = await Promotion.findOne({ name });
            if (promotion) return res.status(400).json({ msg: "This promotion name already exists." });

            // Check if products exists
            for (let i = 0; i < products.length; i++) {
                const product = await Product.findById(products[i].product_id);
                if (!product) return res.status(400).json({ msg: "This product does not exist." });

                // Check if product is already in promotion
                const productPromotion = await Promotion.findOne({ products: { $elemMatch: { product_id: products[i].product_id } } });
                if (productPromotion && productPromotion.endDate > new Date()) return res.status(400).json({ msg: "This product is already in promotion." });
            }
            // Check if discount is valid
            if (discount < 0 || discount > 100) return res.status(400).json({ msg: "Discount must be between 0 and 100." });

            // Check if startDate is valid
            if (startDate < new Date()) return res.status(400).json({ msg: "Start date must be later than current date." });

            // Check if endDate is valid
            if (endDate < startDate) return res.status(400).json({ msg: "End date must be later than start date." });

            // Check if startDate is later than current date, not update product promotion price_discount
            if (startDate > new Date()) return res.status(400).json({ msg: "Start date must be later than current date." });

            const status = startDate <= new Date() ? 1 : 0;
            // Create new promotion
            const newPromotion = new Promotion({
                name,
                description,
                discount,
                status,
                products,
                startDate,
                endDate
            });

            // Save promotion
            await newPromotion.save();

            // update products promotion price_discount
            if (startDate <= new Date()) {
                products.forEach(async (product) => {
                    const productPromotion = await Product.findById(product.product_id);
                    productPromotion.price_discount = productPromotion.price * (1 - discount / 100);

                    await productPromotion.save();
                });
            }

            res.json({ msg: "Created a promotion.", data: newPromotion });
        } catch (err) {
            return res.status(500).json({ msgErr: err.message });
        }
    },
    updatePromotion: async (req, res) => {
        try {
            const { name, description, discount, products, startDate, endDate } = req.body;

            // Check if promotion name already exists
            const promotion = await Promotion.findOne({ name });
            if (promotion && promotion._id != req.params.id) return res.status(400).json({ msg: "This promotion name already exists." });
            // Check if products exists
            if (products) {
                for (let i = 0; i < products.length; i++) {
                    const product = await Product.findById(products[i].product_id);
                    if (!product) return res.status(400).json({ msg: "This product does not exist." });

                    // Check if product is already in promotion
                    const productPromotion = await Promotion.findOne({ products: { $elemMatch: { product_id: products[i].product_id } } });
                    if (productPromotion && productPromotion._id != req.params.id) return res.status(400).json({ msg: "This product is already in promotion." });
                }
            }
            // Check if discount is valid
            if (discount < 0 || discount > 100) return res.status(400).json({ msg: "Discount must be between 0 and 100." });

            // Check if startDate is valid
            if (startDate < new Date()) return res.status(400).json({ msg: "Start date must be later than current date." });

            // Check if endDate is valid
            if (endDate < startDate) return res.status(400).json({ msg: "End date must be later than start date." });

            // Check if startDate is later than current date, not update product promotion price_discount
            if (startDate > new Date()) return res.status(400).json({ msg: "Start date must be later than current date." });

            // update promotion
            await Promotion.findByIdAndUpdate(req.params.id, {
                name,
                description,
                discount,
                products,
                startDate,
                endDate
            });

            // update products promotion price_discount
            if (startDate <= new Date()) {
                for (let i = 0; i < products.length; i++) {
                    const product = await Product.findById(products[i].product_id);
                    product.price_discount = product.price * (1 - discount / 100);
                    await product.save();
                }
            }

            // get promotion after update
            const promotionAfterUpdate = await Promotion.findById(req.params.id);

            res.json({ msg: "Updated a promotion.", data: promotionAfterUpdate });

        } catch (err) {
            return res.status(500).json({ msgErr: err.message });
        }
    },
    deletePromotion: async (req, res) => {
        try {
            await Promotion.findByIdAndDelete(req.params.id);

            // update product promotion price_discount
            const productPromotion = await Product.findOne({ _id: products });
            productPromotion.price_discount = productPromotion.price;

            await productPromotion.save();

            res.json({ msg: "Deleted a promotion." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};


module.exports = promotionCtrl;