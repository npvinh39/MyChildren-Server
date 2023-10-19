const Promotion = require('../models/promotionModel');
const Product = require('../models/productModel');

export const updatePriceDiscount = async () => {
    try {
        const promotions = await Promotion.find();

        promotions.forEach(async (promotion) => {
            if (promotion.startDate <= new Date() && promotion.endDate >= new Date()) {
                promotion.products.forEach(async (product) => {
                    const productPromotion = await Product.findOne({ _id: product.product_id });
                    productPromotion.price_discount = productPromotion.price * (1 - promotion.discount / 100);

                    await productPromotion.save();
                });
            }
            else if (promotion.endDate < new Date()) {
                promotion.products.forEach(async (product) => {
                    const productPromotion = await Product.findOne({ _id: product.product_id });
                    productPromotion.price_discount = productPromotion.price;

                    await productPromotion.save();
                });
            }
        });
    } catch (err) {
        console.log(err);
    }
}
