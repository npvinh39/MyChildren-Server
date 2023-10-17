const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');

const orderCtrl = {
    getOrders: async (req, res) => {
        try {
            const orders = await Order.find();
            res.json(orders);
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
    getOrdersByUser: async (req, res) => {
        try {
            const orders = await Order.find({ user_id: req.params.id });
            res.json(orders);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    createOrder: async (req, res) => {
        try {
            // get id cart_id
            const cart_id = req.params.id;

            const { user_id, code_order, customer, phone, email, shipping, payment_status, payment_method, status, delivery_method, address } = req.body;

            // if user is not logged in
            // if (!user_id) return res.status(400).json({ msg: "Please login to continue!" });

            // if the user is not logged in then they will place an order with user_id as "visitor"
            const user = await User.findById(user_id);
            if (!user) user_id = "visitor";

            // check discount membership with spending
            let discount = 0;
            if (user_id !== "visitor" && user) {
                if (user.spending >= 1000000) {
                    discount = 0.1;
                }
                else if (user.spending >= 500000) {
                    discount = 0.05;
                }
                else if (user.spending >= 100000) {
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
                total_amount += product.price * products[i].quantity;
            }

            // calculate final total
            let final_total = total_amount + shipping - (total_amount * discount);

            // add the order
            const newOrder = new Order({
                user_id, code_order, products: products, customer, phone, email, discount, shipping, total_amount, final_total, payment_status, payment_method, status, delivery_method, address
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

            // Return success message
            res.json({ msg: "Created order Successfully!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateOrder: async (req, res) => {
        try {
            const { user_id, products, customer, phone, email, discount, shipping, total_amount, final_total, payment_status, payment_method, status, delivery_method, address } = req.body;

            // Update order
            await Order.findOneAndUpdate({ _id: req.params.id }, {
                user_id, products, customer, phone, email, discount, shipping, total_amount, final_total, payment_status, payment_method, status, delivery_method, address
            });

            // Return success message
            res.json({ msg: "Updated order Successfully!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteOrder: async (req, res) => {
        try {
            await Order.findByIdAndDelete(req.params.id);
            res.json({ msg: "Deleted order Successfully!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = orderCtrl;