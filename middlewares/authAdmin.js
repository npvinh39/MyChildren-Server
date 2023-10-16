const Admin = require('../models/adminModel');

const authAdmin = async (req, res, next) => {
    try {
        // get admin information by id
        const admin = await Admin.findOne({
            _id: req.user.id
        });

        if (!admin) {
            return res.status(400).json({ msg: "Admin does not exist." });
        }

        if (admin.role !== "admin")
            return res.status(400).json({ msg: "Admin resources access denied." });

        next();
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}

module.exports = authAdmin;