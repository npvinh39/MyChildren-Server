const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
const APIFeatures = require('../utils/apiFeatures');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userCtrl = {
    register: async (req, res) => {
        try {
            const { last_name, first_name, email, password, phone } = req.body;

            // Check if user already exists
            const user = await User.findOne({ email });
            if (user) return res.status(401).json({ msg: "Email này đã được sử dụng" });

            // Check if password is at least 6 characters long
            // if (password.length < 6)
            //     return res.status(401).json({ msg: "Mật khẩu dài ít nhất 6 ký tự" });

            // Check if new password meets additional criteria
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
            if (!passwordRegex.test(password))
                return res.status(401).json({ msg: "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character." });

            // Encrypt password
            const passwordHash = await bcrypt.hash(password, 10);

            // add the user
            const newUser = new User({
                last_name, first_name, email, password: passwordHash, phone
            });

            // add the cart
            const newCart = new Cart({
                user_id: newUser._id

            });

            // Save user to database
            await newUser.save();

            // Save cart to database
            await newCart.save();

            // Create access token and refresh token
            const accessToken = createAccessToken({ id: newUser._id });
            const refreshToken = createRefreshToken({ id: newUser._id });

            // Set refresh token as cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
            });

            // Return access token and new user's information
            res.json({ accessToken, refreshToken, newUser });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    login: async (req, res) => {
        try {
            // Get login info from client
            const { email, password } = req.body;

            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ msg: "Người dùng không tồn tại" });

            // Check if password is correct
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ msg: "Mật khẩu không đúng" });

            // Create access token and refresh token
            const accessToken = createAccessToken({ id: user._id });
            const refreshToken = createRefreshToken({ id: user._id });

            // Return access token and refresh token
            res.json({ accessToken, refreshToken });
        }
        catch {
            // Return error if any error occurs
            return res.status(500).json({ msg: err.message });
        }
    },

    logout: async (req, res) => {
        try {
            // Clear refresh token cookie
            res.clearCookie('refreshToken', { path: '/' });
            return res.json({ msg: "Đăng xuất thành công" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    viewProfile: async (req, res) => {
        try {
            //view profile with access token
            const id = req.user.id;
            const user = await User.findById(id);
            // -password
            const { password, ...info } = user._doc;
            // get cart information
            const cart = await Cart.findOne({ user_id: id });
            // get address array information from address_id array
            const address = await Address.find({ _id: { $in: info.address_id } });
            // sort addresses by adress_id array in user (default address is in 0 index array)
            address.sort((a, b) => {
                return info.address_id.indexOf(a._id) - info.address_id.indexOf(b._id);
            });

            res.json({ ...info, cart, address });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const id = req.user.id;
            const { email, last_name, first_name, phone } = req.body;

            // Check if user exists
            const user = await User.findById(id);
            if (!user) return res.status(404).json({ msg: "User does not exist." });

            // Update user's profile
            await User.findByIdAndUpdate(user._id, { email, last_name, first_name, phone });

            const updatedUser = await User.findById(user._id);
            // -password
            const { password, ...info } = updatedUser._doc;
            // get cart information
            const cart = await Cart.findOne({ user_id: id });
            // get address array information from address_id array
            const address = await Address.find({ _id: { $in: info.address_id } });

            // Return message indicating that the profile has been updated
            res.json({ msg: "Profile successfully updated!", data: { ...info, cart, address } });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const features = new APIFeatures(User.find(), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();

            const users = await features.query;

            res.json({
                status: 'success',
                result: users.length,
                totalPages: Math.ceil(await User.countDocuments().exec() / req.query.limit),
                users: users
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            res.json(user);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateUser: async (req, res) => {
        try {
            const { last_name, first_name, email, phone } = req.body;
            await User.findByIdAndUpdate(req.params.id, { last_name, first_name, email, phone });
            res.json({ msg: "User successfully updated!", user: req.body });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);

            await Cart.findOneAndDelete({ user_id: req.params.id });

            res.json({ msg: "User successfully deleted!", id: req.params.id });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    refreshToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshToken;
            if (!rf_token) return res.status(400).json({ msg: "Please login or register" });

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET_KEY, (err, user) => {
                if (err) return res.status(400).json({ msg: "Please login or register" });

                const accessToken = createAccessToken({ id: user.id });

                res.json({ accessToken });
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    changePassword: async (req, res) => {
        try {
            const id = req.user.id;
            const { password, newPassword } = req.body;
            const user = await User.findById(id);
            if (!user) return res.status(404).json({ msg: "User does not exist." });

            // Check if old password is correct
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ msg: "Mật khẩu hiện tại không đúng" });

            // Check if new password is at least 8 characters long
            if (newPassword.length < 8)
                return res.status(401).json({ msg: "Password is at least 8 characters long." });

            // Check if new password meets additional criteria
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
            if (!passwordRegex.test(newPassword))
                return res.status(401).json({ msg: "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character." });

            // Encrypt new password and update user's password
            const passwordHash = await bcrypt.hash(newPassword, 10);
            await User.findByIdAndUpdate(user._id, { password: passwordHash });

            // Return message indicating that the password has been changed
            res.json({ msg: "Password successfully changed!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    changePhone: async (req, res) => {
        try {
            const { email, phone } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ msg: "User does not exist." });

            // Update user's phone number
            await User.findByIdAndUpdate(user._id, { phone });

            // Return message indicating that the phone number has been changed
            res.json({ msg: "Phone number successfully changed!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    changeName: async (req, res) => {
        try {
            const { email, last_name, first_name } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ msg: "User does not exist." });

            // Update user's name
            await User.findByIdAndUpdate(user._id, { last_name, first_name });

            // Return message indicating that the name has been changed
            res.json({ msg: "Name successfully changed!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    changeEmail: async (req, res) => {
        try {
            const { email, newEmail } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ msg: "User does not exist." });

            await User.findByIdAndUpdate(user._id, { email: newEmail });

            res.json({ msg: "Email successfully changed!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

};

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1d' });
};

const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' });
}

module.exports = userCtrl;