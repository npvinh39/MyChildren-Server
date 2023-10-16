const Category = require('../models/categoriesModel');
const Product = require('../models/productModel');

const categoryCtrl = {
    getCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            res.json(categories);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    createCategory: async (req, res) => {
        try {
            // only admin can create , delete and update category
            const { name, image, description } = req.body;
            const category = await Category.findOne({ name });
            if (category) return res.status(400).json({ msg: "This category already exists." });

            const newCategory = new Category({ name, image, description });

            await newCategory.save();
            res.json({ msg: "Created a category" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const products = await Product.findOne({ category_id: req.params.id })
            if (products) return res.status(400).json({
                msg: "Please delete all products with a relationship."
            })

            const category = await Category.findOne({ _id: req.params.id });
            if (!category) return res.status(404).json({
                msg: "Category does not Exists"
            });

            await Category.findByIdAndDelete(req.params.id)
            res.json({ msg: "Deleted a Category" })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    updateCategory: async (req, res) => {
        try {
            const { name, image, description } = req.body;
            const category = await Category.findOneAndUpdate({ _id: req.params.id }, { name, image, description });
            if (!category) return res.status(404).json({ msg: "Category does not exists" });

            res.json({ msg: "Updated a category" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = categoryCtrl;