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
            const { products } = req.body;

            // If the user is not logged in
            if (!req.user.id) return res.status(400).json({ msg: "Please login to continue!" });

            // Get the user's cart
            let cart = await Cart.findOne({ user_id: req.user.id });

            // If the cart is not found, create a new one
            if (!cart) {
                const newCart = new Cart({
                    user_id: req.user.id,
                    products: [],
                    total_price: 0
                });
                await newCart.save();
                cart = newCart;
            }

            for (const productInfo of products) {
                const { product_id, quantity } = productInfo;
                const product = cart.products.find(p => p.product_id === product_id);

                if (product) {
                    // Update the number of products currently in the cart
                    product.quantity += quantity;
                } else {
                    // Add a new product to the cart
                    cart.products.push({
                        product_id,
                        quantity
                    });
                }
            }

            // Calculate the total price
            cart.total_price = 0;
            for (const cartProduct of cart.products) {
                const product = await Product.findById(cartProduct.product_id);
                cart.total_price += product.price_discount * cartProduct.quantity;
            }

            // Save the updated cart
            await cart.save();

            return res.json({ msg: "Updated cart!", cart });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateCart: async (req, res) => {
        try {
            const { products } = req.body;

            // If the user is not logged in
            if (!req.user.id) return res.status(400).json({ msg: "Please login to continue!" });

            // Get the user's cart
            let cart = await Cart.findOne({ user_id: req.user.id });

            // If the cart is not found, create a new one
            if (!cart) {
                const newCart = new Cart({
                    user_id: req.user.id,
                    products: [],
                    total_price: 0
                });
                await newCart.save();
                cart = newCart;
            }

            for (const productInfo of products) {
                const { product_id, quantity } = productInfo;
                const product = cart.products.find(p => p.product_id === product_id);

                if (product) {
                    // Update the number of products currently in the cart by getting the received quantity
                    product.quantity = quantity;
                } else {
                    // Add a new product to the cart
                    cart.products.push({
                        product_id,
                        quantity
                    });
                }
            }

            // Calculate the total price
            cart.total_price = 0;
            for (const cartProduct of cart.products) {
                const product = await Product.findById(cartProduct.product_id);
                cart.total_price += product.price_discount * cartProduct.quantity;
            }

            // Save the updated cart
            await cart.save();

            return res.json({ msg: "Updated cart!", cart });
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
            return res.json({ msg: "Deleted product!", cart });
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