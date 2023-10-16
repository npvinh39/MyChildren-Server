const Promotion = require('../models/promotionModel');
const Product = require('../models/productModel');
const cron = require('cron');

const schedulePromotion = {
    // Update product promotion price_discount after startDate and update price_discount equal price product after endDate
    updatePriceDiscount: new cron.CronJob('*/10 * * * * *', async () => {
        try {
            const promotions = await Promotion.find();
            // const products = await Product.find();

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
    }),
}

module.exports = schedulePromotion;