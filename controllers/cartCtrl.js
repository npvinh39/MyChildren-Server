const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const cartCtrl = {
    getCart: async (req, res) => {
        try {
            const cart = await Cart.findOne({ user_id: req.params.user_id });
            res.json(cart);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    addToCart: async (req, res) => {
        try {
            const { product_id, quantity } = req.body;

            // if user is not logged in
            if (!req.params.user_id) return res.status(400).json({ msg: "Please login to continue!" });

            // get cart
            const cart = await Cart.findOne({ user_id: req.user.id });

            // if cart is not found
            if (!cart) {
                // create new cart
                const newCart = new Cart({
                    user_id: req.user.id,
                    products: [{
                        product_id: product_id,
                        quantity: quantity
                    }],
                    total_price: 0
                });

                // save cart
                await newCart.save();

                // return response
                return res.json({ msg: "Added to cart!" });
            }

            // if cart is found
            // check if product is already in cart
            const product = cart.products.find(product => product.product_id === product_id);

            // if product is already in cart
            if (product) {
                // update quantity
                product.quantity += quantity;
            }
            else {
                // add new product
                cart.products.push({
                    product_id: product_id,
                    quantity: quantity
                });
            }

            // update total price
            cart.total_price = 0;
            for (let i = 0; i < cart.products.length; i++) {
                const product = await Product.findById(cart.products[i].product_id);
                cart.total_price += product.price * cart.products[i].quantity;
            }

            // save cart
            await cart.save();

            // return response
            return res.json({ msg: "Added to cart!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateCart: async (req, res) => {
        try {
            const { product_id, quantity } = req.body;

            // if user is not logged in
            if (!req.user.id) return res.status(400).json({ msg: "Please login to continue!" });

            // get cart
            const cart = await Cart.findOne({ user_id: req.user.id });

            // if cart is not found
            if (!cart) {
                // create new cart
                const newCart = new Cart({
                    user_id: req.user.id,
                    products: [{
                        product_id: product_id,
                        quantity: quantity
                    }],
                    total_price: 0
                });

                // save cart
                await newCart.save();

                // return response
                return res.json({ msg: "Updated cart!" });
            }

            // if cart is found
            // check if product is already in cart
            const product = cart.products.find(product => product.product_id === product_id);

            // if product is already in cart
            if (product) {
                // update quantity
                product.quantity = quantity;
            }
            else {
                // add new product
                cart.products.push({
                    product_id: product_id,
                    quantity: quantity
                });
            }

            // update total price
            cart.total_price = 0;
            for (let i = 0; i < cart.products.length; i++) {
                const product = await Product.findById(cart.products[i].product_id);
                cart.total_price += product.price * cart.products[i].quantity;
            }

            // save cart
            await cart.save();

            // return response
            return res.json({ msg: "Updated cart!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const product_id = req.params.id;

            // if user is not logged in
            if (!req.user.id) return res.status(400).json({ msg: "Please login to continue!" });

            // get cart
            const cart = await Cart.findOne({ user_id: req.user.id });

            // if cart is not found
            if (!cart) {
                return res.status(400).json({ msg: "Cart not found!" });
            }

            // if cart is found
            // check if product is already in cart
            const product = cart.products.find(product => product.product_id === product_id);

            // if product is not found
            if (!product) {
                return res.status(400).json({ msg: "Product not found!" });
            }

            // if product is found
            // delete product
            await Cart.findOneAndUpdate({ user_id: req.user.id }, {
                $pull: {
                    products: {
                        product_id: product_id
                    }
                }
            });

            // update total price
            cart.total_price = 0;
            for (let i = 0; i < cart.products.length; i++) {
                const product = await Product.findById(cart.products[i].product_id);
                cart.total_price += product.price * cart.products[i].quantity;
            }

            // save cart
            await cart.save();

            // return response
            return res.json({ msg: "Deleted product!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteAllProducts: async (req, res) => {
        try {
            // if user is not logged in
            if (!req.user.id) return res.status(400).json({ msg: "Please login to continue!" });

            // get cart
            const cart = await Cart.findOne({ user_id: req.user.id });

            // if cart is not found
            if (!cart) {
                return res.status(400).json({ msg: "Cart not found!" });
            }

            // if cart is found
            // delete all products
            await Cart.findOneAndUpdate({ user_id: req.user.id }, {
                $set: {
                    products: []
                }
            });

            // update total price
            cart.total_price = 0;

            // save cart
            await cart.save();

            // return response
            return res.json({ msg: "Deleted all products!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteCart: async (req, res) => {
        try {
            // if user is not logged in
            if (!req.user.id) return res.status(400).json({ msg: "Please login to continue!" });

            // get cart
            const cart = await Cart.findOne({ user_id: req.user.id });

            // if cart is not found
            if (!cart) {
                return res.status(400).json({ msg: "Cart not found!" });
            }

            // if cart is found
            // delete cart
            await Cart.findOneAndDelete({ user_id: req.user.id });

            // return response
            return res.json({ msg: "Deleted cart!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }

}

module.exports = cartCtrl;