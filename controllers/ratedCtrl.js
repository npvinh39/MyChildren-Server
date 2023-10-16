const Rated = require('../models/ratedModel');

const ratedCtrl = {
    getRateds: async (req, res) => {
        try {
            const rateds = await Rated.find();
            res.json(rateds);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getRated: async (req, res) => {
        try {
            const rated = await Rated.findById(req.params.id);
            res.json(rated);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getRatedByProduct: async (req, res) => {
        try {
            const rated = await Rated.find({ product_id: req.params.id });
            res.json(rated);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    createRated: async (req, res) => {
        try {
            const { product_id, rating, comment, user_id } = req.body;

            // check user rated rating product_id
            const rated = await Rated.findOne({ product_id, user_id });
            if (rated) return res.status(400).json({ msg: "You have rated this product." });

            // add the rated
            const newRated = new Rated({
                product_id, rating, comment, user_id
            });

            // Save rated to database
            await newRated.save();

            // Return success message
            res.json({ msg: "Created rated Successfully!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateRated: async (req, res) => {
        try {
            const { product_id, rating, comment, user_id } = req.body;

            // Update rated
            const rated = await Rated.findOneAndUpdate({ _id: req.params.id }, {
                product_id, rating, comment, user_id
            });

            // check rated
            if (!rated) return res.status(400).json({ msg: "This rated does not exist." });

            // Return success message
            res.json({ msg: "Updated rated Successfully!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    deleteRated: async (req, res) => {
        try {
            const rated = await Rated.findByIdAndDelete(req.params.id);

            // check rated
            if (!rated) return res.status(400).json({ msg: "This rated does not exist." });

            res.json({ msg: "Deleted rated Successfully!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = ratedCtrl;