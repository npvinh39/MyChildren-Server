const Category = require('../models/categoriesModel');
const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');

const categoryCtrl = {
    getCategories: async (req, res) => {
        try {
            const features = new APIFeatures(Category.find(), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();

            const categories = await features.query;

            res.json({
                status: 'success',
                results: categories.length,
                totalPages: Math.ceil(await Category.countDocuments().exec() / req.query.limit),
                data: {
                    categories
                }
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            res.json({ categories });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getCategory: async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);
            res.json(category);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    createCategory: async (req, res) => {
        try {
            // only admin can create , delete and update category
            const { name, image, description } = req.body;
            const category = await Category.findOne({ name });
            if (category) return res.status(401).json({ msg: "Tên danh mục đã tồn tại" });

            const newCategory = new Category({ name, image, description });

            await newCategory.save();
            res.json({ msg: "Created a category", data: newCategory });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const products = await Product.findOne({ category_id: req.params.id })
            if (products) return res.status(401).json({
                msg: "Vui lòng xóa tất cả sản phẩm thuộc danh mục này trước khi xóa"
            })

            const category = await Category.findOne({ _id: req.params.id });
            if (!category) return res.status(404).json({
                msg: "Category does not Exists"
            });

            await Category.findByIdAndDelete(req.params.id)
            res.json({ msg: "Xóa danh mục thành công" })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    updateCategory: async (req, res) => {
        try {
            const { name, image, description } = req.body;
            const category = await Category.findOneAndUpdate({ _id: req.params.id }, { name, image, description });
            if (!category) return res.status(404).json({ msg: "Category does not exists" });

            const result = await Category.findById(req.params.id);

            res.json({ msg: "Updated a category", data: result });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = categoryCtrl;