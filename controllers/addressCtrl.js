const Address = require('../models/addressModel');
const User = require('../models/userModel');

const addressCtrl = {
    getAddress: async (req, res) => {
        try {
            const addresses = await Address.find();

            res.json(addresses);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getAddressById: async (req, res) => {
        try {
            const address = await Address.findById(req.params.id);

            res.json(address);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getAddressByUserId: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            const addresses = await Address.find({ _id: { $in: user.address_id } });

            res.json(addresses);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    createAddress: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            const { province, district, ward, number_street } = req.body;

            if (!province || !district || !ward || !number_street)
                return res.status(400).json({ msg: "Please input all fields." });

            const newAddress = new Address({
                province, district, ward, number_street
            });

            user.address_id.push(newAddress._id);

            await user.save();

            await newAddress.save();

            res.json({ msg: "Created a new address." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateAddress: async (req, res) => {
        try {
            const { province, district, ward, number_street } = req.body;

            if (!province || !district || !ward || !number_street)
                return res.status(400).json({ msg: "Please input all fields." });

            await Address.findOneAndUpdate({ _id: req.params.id }, {
                province, district, ward, number_street
            });

            res.json({ msg: "Updated an address." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteAddress: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            const address = await Address.findById(req.params.id);

            await Address.findByIdAndDelete(req.params.id);

            user.address_id.pull(address._id);

            await user.save();

            res.json({ msg: "Deleted an address." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = addressCtrl;