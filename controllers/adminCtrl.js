const Admin = require('../models/adminModel');
const APIFeatures = require('../utils/apiFeatures');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminCtrl = {
    register: async (req, res) => {
        try {
            const { last_name, first_name, email, password, phone } = req.body;

            // Check if admin already exists
            const admin = await Admin.findOne({ email });
            if (admin) return res.status(401).json({ msg: "The email already exists." });

            // Check if password is at least 6 characters long
            // if (password.length < 6)
            //     return res.status(401).json({ msg: "Password is at least 6 characters long." });

            // Check if new password meets additional criteria
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;
            if (!passwordRegex.test(password))
                return res.status(401).json({ msg: "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character." });

            // Encrypt password
            const passwordHash = await bcrypt.hash(password, 10);
            const newAdmin = new Admin({
                last_name, first_name, email, password: passwordHash, phone
            });

            // Save admin to database
            await newAdmin.save();

            // Create access token and refresh token
            const accessToken = createAccessToken({ id: newAdmin._id });
            const refreshToken = createRefreshToken({ id: newAdmin._id });

            // Set refresh token as cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
            });

            // Return access token and new admin's information
            res.json({ accessToken, newAdmin });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    login: async (req, res) => {
        try {
            // Get login info from client
            const { email, password } = req.body;

            // Check if admin exists
            const admin = await Admin.findOne({ email });
            if (!admin) return res.status(404).json({ msg: "Admin does not exist." });

            // Check if password is correct
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) return res.status(401).json({ msg: "Incorrect password." });

            // Check if admin is activated
            if (admin.status !== "activated") return res.status(401).json({ msg: "Admin is not activated." });

            // Create access token and refresh token
            const accessToken = createAccessToken({ id: admin._id });
            const refreshToken = createRefreshToken({ id: admin._id });

            // Set refresh token as cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
            });

            // Return access token and refresh token information
            res.json({ accessToken, refreshToken });
        } catch (err) {
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

    refreshToken: async (req, res) => {
        try {
            // Get refresh token from cookie
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) return res.status(401).json({ msg: "Please login now." });

            // Verify refresh token
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, (err, user) => {
                if (err) return res.status(401).json({ msg: "Please login now." });

                // Create new access token
                const accessToken = createAccessToken({ id: user.id });

                // Return new access token
                res.json({ accessToken });
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    viewProfile: async (req, res) => {
        try {
            const profile = await Admin.findById(req.user.id).select('-password');
            if (!profile) return res.status(404).json({ msg: "Admin does not exist." });
            res.json(profile);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getAllAdmins: async (req, res) => {
        try {
            const features = new APIFeatures(Admin.find().select('-password'), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();

            const admins = await features.query;
            res.json({
                status: 'success',
                result: admins.length,
                totalPages: Math.ceil(await Admin.countDocuments().exec() / req.query.limit),
                admins: admins
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getAdmin: async (req, res) => {
        try {
            const admin = await Admin.findById(req.params.id).select('-password');
            if (!admin) return res.status(404).json({ msg: "Admin does not exist." });
            res.json(admin);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateAdmin: async (req, res) => {
        try {
            const { last_name, first_name, email, phone, status, role } = req.body;

            // Check if admin exists
            const admin = await Admin.findById(req.params.id);
            if (!admin) return res.status(404).json({ msg: "Admin does not exist." });

            // Check if email already exists
            const emailExist = await Admin.findOne({ email });
            if (emailExist && email !== admin.email)
                return res.status(401).json({ msg: "The email already exists." });

            // Update admin's information
            await Admin.findByIdAndUpdate(req.user.id, {
                last_name, first_name, email, phone, status, role
            });

            // Get admin's updated information
            const updatedAdmin = await Admin.findById(req.params.id).select('-password');

            // Return success message
            res.json({ msg: "Update Success!", data: updatedAdmin });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteAdmin: async (req, res) => {
        try {
            const id = req.params.id;
            const admin = await Admin.findByIdAndDelete(id);
            if (!admin) return res.status(404).json({ msg: "Admin does not exist." });
            res.json({ msg: "Deleted Success!", id });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { last_name, first_name, email, phone } = req.body;

            // Check if admin exists
            const admin = await Admin.findById(req.user.id);
            if (!admin) return res.status(404).json({ msg: "Admin does not exist." });

            // Check if email already exists
            const emailExist = await Admin.findOne({ email });
            if (emailExist && email !== admin.email)
                return res.status(401).json({ msg: "The email already exists." });

            // Update admin's information
            await Admin.findByIdAndUpdate(req.user.id, {
                last_name, first_name, email, phone
            });

            // Return success message
            res.json({ msg: "Update Success!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;

            // Check if admin exists
            const admin = await Admin.findById(req.user.id);
            if (!admin) return res.status(404).json({ msg: "Admin does not exist." });

            // Check if old password is correct
            const isMatch = await bcrypt.compare(oldPassword, admin.password);
            if (!isMatch) return res.status(401).json({ msg: "Incorrect password." });

            // Check if new password meets additional criteria
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;
            if (!passwordRegex.test(newPassword))
                return res.status(401).json({ msg: "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character." });

            // Encrypt new password
            const passwordHash = await bcrypt.hash(newPassword, 10);

            // Update admin's password
            await Admin.findByIdAndUpdate(req.user.id, { password: passwordHash });

            // Return success message
            res.json({ msg: "Password successfully changed!" });
        } catch (err) {
            return res.status(500).json({ msgError: err.message });
        }
    },
    updatePassword: async (req, res) => {
        try {
            const { password } = req.body;

            const ad = await Admin.findById(req.user.id);

            // Check if admin exists
            const admin = await Admin.findById(req.params.id);
            if (!admin) return res.status(404).json({ msg: "Admin does not exist." });

            if (ad.role !== 'admin') return res.status(401).json({ msg: "You are not allowed to change password of this admin." });

            // Check if new password meets additional criteria
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;
            if (!passwordRegex.test(password))
                return res.status(401).json({ msg: "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character." });

            // Encrypt new password
            const passwordHash = await bcrypt.hash(password, 10);

            // Update admin's password
            await Admin.findByIdAndUpdate(req.params.id, { password: passwordHash });

            // Return success message
            res.json({ msg: "Password successfully changed!" });
        } catch (err) {
            return res.status(500).json({ msgError: err.message });
        }
    },
};

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '3h' });
}

const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' });
}


module.exports = adminCtrl;