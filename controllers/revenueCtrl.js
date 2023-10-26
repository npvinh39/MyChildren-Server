const Revenue = require('../models/revenueModel');
const APIFeatures = require('../utils/apiFeatures');

const revenueCtrl = {
    getRevenue: async (req, res) => {
        try {
            const features = new APIFeatures(Revenue.find(), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();

            const revenues = await features.query;

            res.json({
                status: 'success',
                result: revenues.length,
                totalPages: Math.ceil(await Revenue.countDocuments().exec() / req.query.limit),
                revenue: revenues
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    getRevenueByDate: async (req, res) => {
        try {
            const revenues = await Revenue.find({ date: req.params.date });

            res.json(revenues);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getRevenueByMonth: async (req, res) => {
        try {
            const revenues = await Revenue.find({ date: { $regex: req.params.month } });

            res.json(revenues);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getRevenueByYear: async (req, res) => {
        try {
            const revenues = await Revenue.find({ date: { $regex: req.params.year } });

            res.json(revenues);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getTotalRevenue: async (req, res) => {
        try {
            const revenues = await Revenue.find();

            let total = 0;

            revenues.forEach(revenue => {
                total += revenue.total_price;
            });

            res.json(total);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getTotalRevenueByDate: async (req, res) => {
        try {
            const revenues = await Revenue.find({ date: req.params.date });

            let total = 0;

            revenues.forEach(revenue => {
                total += revenue.total_price;
            });

            res.json(total);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getTotalRevenueByMonth: async (req, res) => {
        try {
            const revenues = await Revenue.find({ date: { $regex: req.params.month } });

            let total = 0;

            revenues.forEach(revenue => {
                total += revenue.total_price;
            });

            res.json(total);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getTotalRevenueByYear: async (req, res) => {
        try {
            const revenues = await Revenue.find({ date: { $regex: req.params.year } });

            let total = 0;

            revenues.forEach(revenue => {
                total += revenue.total_price;
            });

            res.json(total);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getQuantityRevenue: async (req, res) => {
        try {
            const revenues = await Revenue.find();

            let total = 0;

            revenues.forEach(revenue => {
                total += revenue.quantity;
            });

            res.json(total);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getQuantityRevenueByDate: async (req, res) => {
        try {
            const revenues = await Revenue.find({ date: req.params.date });

            let total = 0;

            revenues.forEach(revenue => {
                total += revenue.quantity;
            });

            res.json(total);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getQuantityRevenueByMonth: async (req, res) => {
        try {
            const revenues = await Revenue.find({ date: { $regex: req.params.month } });

            let total = 0;

            revenues.forEach(revenue => {
                total += revenue.quantity;
            });

            res.json(total);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getQuantityRevenueByYear: async (req, res) => {
        try {
            const revenues = await Revenue.find({ date: { $regex: req.params.year } });

            let total = 0;

            revenues.forEach(revenue => {
                total += revenue.quantity;
            });

            res.json(total);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    createRevenue: async (req, res) => {
        try {
            const { quantity, total_price } = req.body;

            const revenue = new Revenue({
                quantity,
                total_price
            });

            await revenue.save();

            res.json({ msg: "Created a revenue" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    updateRevenue: async (req, res) => {
        try {
            const { quantity, total_price } = req.body;

            await Revenue.findOneAndUpdate({ _id: req.params.id }, {
                quantity,
                total_price
            });

            res.json({ msg: "Updated a revenue" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteRevenue: async (req, res) => {
        try {
            await Revenue.findByIdAndDelete(req.params.id);

            res.json({ msg: "Deleted a revenue" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    deleteAllRevenue: async (req, res) => {
        try {
            await Revenue.deleteMany();

            res.json({ msg: "Deleted all revenue" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
}

module.exports = revenueCtrl;