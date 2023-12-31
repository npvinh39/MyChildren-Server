const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const APIFeatures = require('../utils/apiFeatures');
const nodemailer = require('nodemailer');

const orderCtrl = {
    getOrders: async (req, res) => {
        try {
            const features = new APIFeatures(Order.find(), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();
            const orders = await features.query;

            res.json({
                status: 'success',
                result: orders.length,
                totalPages: Math.ceil(await Order.countDocuments().exec() / req.query.limit),
                orders: orders
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getOrder: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);
            res.json(order);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getOrderByCode: async (req, res) => {
        try {
            const order = await Order.findOne({ code_order: req.params.code });
            res.json(order);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getOrdersByUser: async (req, res) => {
        try {
            const features = new APIFeatures(Order.find({ user_id: req.params.id }), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();
            const orders = await features.query;

            res.json({
                status: 'success',
                result: orders.length,
                totalPages: Math.ceil(await Order.countDocuments({ user_id: req.params.id }).exec() / req.query.limit),
                orders: orders
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getOrdersLength: async (req, res, next) => {
        try {
            const orders = await Order.find();
            res.json({ length: orders.length });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    createOrder: async (req, res) => {
        try {
            // get id cart_id
            const cart_id = req.params.id;

            const user_id = req.user.id;

            const { code_order, customer, phone, email, shipping, payment_status, payment_method, delivery_method, address } = req.body;

            // if user is not logged in
            if (!user_id) return res.status(401).json({ msg: "Please login to continue!" });

            // if the user is not logged in then they will place an order with user_id as "visitor"
            const user = await User.findById(user_id);
            if (!user) user_id = "visitor";

            // check discount membership with spending
            let discount = 0;
            if (user_id !== "visitor" && user) {
                if (user.spending >= 10000000) {
                    discount = 0.1;
                }
                else if (user.spending >= 5000000) {
                    discount = 0.05;
                }
                else if (user.spending >= 2000000) {
                    discount = 0.02;
                }
                else {
                    discount = 0;
                }
            }

            // get cart
            const cart = await Cart.findById(cart_id);
            const products = cart.products;

            // calculate total amount
            let total_amount = 0;
            for (let i = 0; i < products.length; i++) {
                const product = await Product.findById(products[i].product_id);
                total_amount += product.price_discount * products[i].quantity;
            }

            // calculate final total
            let final_total = total_amount + shipping - (total_amount * discount);

            // add the order
            const newOrder = new Order({
                user_id, code_order, products: products, customer, phone, email, discount, shipping, total_amount, final_total, payment_status, payment_method, delivery_method, address
            });

            // Save order to database
            await newOrder.save();


            // update product stock and sold
            for (let i = 0; i < cart.products.length; i++) {
                const product = await Product.findById(cart.products[i].product_id);
                await Product.findOneAndUpdate({ _id: cart.products[i].product_id }, {
                    stock: product.stock - cart.products[i].quantity,
                    sold: product.sold + cart.products[i].quantity
                });
            }

            // update cart
            if (cart_id) {
                await Cart.findOneAndUpdate({ _id: cart_id }, {
                    products: [],
                    total_price: 0
                });
            }

            // update user default address and spending
            if (user_id !== "visitor" || !user_id) {
                await User.findOneAndUpdate({ _id: user_id }, {
                    default_address: address,
                    spending: user.spending + final_total
                });
            }

            // send email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const orderUrl = `${process.env.CLIENT_URL}/order/${code_order}`

            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: email,
                subject: 'Order confirmation',
                html: `<h1>Thank you for your order!</h1>
                <p>Hi ${customer},</p>
                <p>We're getting your order ready to be shipped. We will notify you when it has been sent.</p>
                <p>Your order number is <strong>${code_order}</strong>.</p>
                <p>Check the status of your order <a href="${orderUrl}">here</a>.</p>
                <p>Thanks for shopping with us.</p>`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                }
            });

            // Return success message
            res.json({ msg: "Created order Successfully!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    cancelOrder: async (req, res) => {
        try {
            const id = req.params.id;
            const order = await Order.findById(id);

            // check if the order is "pending"
            if (order.status === "pending") {
                // update order status
                await Order.findOneAndUpdate({ _id: id }, {
                    status: "cancelled"
                });

                // update product stock and sold
                for (let i = 0; i < order.products.length; i++) {
                    const product = await Product.findById(order.products[i].product_id);
                    await Product.findOneAndUpdate({ _id: order.products[i].product_id }, {
                        stock: product.stock + order.products[i].quantity,
                        sold: product.sold - order.products[i].quantity
                    });
                }

                // update user spending
                if (order.user_id !== "visitor") {
                    const user = await User.findById(order.user_id);
                    await User.findOneAndUpdate({ _id: order.user_id }, {
                        spending: user.spending - order.final_total
                    });
                }

                // Return success message
                res.json({ msg: "Cancelled order Successfully!" });
            }
            else {
                return res.status(400).json({ msg: "You can only cancel the order if it is 'Chờ xác nhận'!" });
            }
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateOrder: async (req, res) => {
        try {
            const id = req.params.id;
            const { user_id, products, customer, phone, email, discount, shipping, total_amount, final_total, payment_status, payment_method, status, delivery_method, address } = req.body;

            // if status is "cancelled" then update product stock and sold
            if (status === "cancelled") {
                const order = await Order.findById(id);
                if (order.status !== "cancelled") {
                    for (let i = 0; i < order.products.length; i++) {
                        const product = await Product.findById(order.products[i].product_id);
                        await Product.findOneAndUpdate({ _id: order.products[i].product_id }, {
                            stock: product.stock + order.products[i].quantity,
                            sold: product.sold - order.products[i].quantity
                        });
                    }
                }
            }

            // Update order
            await Order.findOneAndUpdate({ _id: id }, {
                user_id, products, customer, phone, email, discount, shipping, total_amount, final_total, payment_status, payment_method, status, delivery_method, address
            });

            const order = await Order.findById(id);

            // Return success message
            res.json({ msg: "Updated order Successfully!", data: order });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteOrder: async (req, res) => {
        try {
            const id = req.params.id;
            await Order.findByIdAndDelete(id);
            res.json({ msg: "Deleted order Successfully!", data: { id } });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = orderCtrl;