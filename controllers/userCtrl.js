const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userCtrl = {
    register: async (req, res) => {
        try {
            const { last_name, first_name, email, password, phone } = req.body;

            // Check if user already exists
            const user = await User.findOne({ email });
            if (user) return res.status(401).json({ msg: "The email already exists." });

            // Check if password is at least 6 characters long
            if (password.length < 6)
                return res.status(401).json({ msg: "Password is at least 6 characters long." });

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
            res.json({ accessToken, newUser });
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
            if (!user) return res.status(404).json({ msg: "User does not exist." });

            // Check if password is correct
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ msg: "Incorrect password." });

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
            return res.json({ msg: "Logged out" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    viewProfile: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email }).select({ '-password': 0, '-_id': 0 });
            if (!user) return res.status(404).json({ msg: "User does not exist." });
            res.json({ user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { email, last_name, first_name, phone } = req.body;

            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ msg: "User does not exist." });

            // Update user's profile
            await User.findByIdAndUpdate(user._id, { last_name, first_name, phone });

            // Return message indicating that the profile has been updated
            res.json({ msg: "Profile successfully updated!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select({ '-password': 0 });
            if (!users) return res.status(404).json({ msg: "No user found." });
            res.json({ users });
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
            const { email, password, newPassword } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ msg: "User does not exist." });

            // Check if old password is correct
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ msg: "Incorrect password." });

            // Check if new password is at least 6 characters long
            if (newPassword.length < 6)
                return res.status(401).json({ msg: "Password is at least 6 characters long." });

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