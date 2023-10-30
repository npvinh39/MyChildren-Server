const Contact = require("../models/contactModel");
const APIFeatures = require("../utils/apiFeatures");

const contactCtrl = {
    getContacts: async (req, res) => {
        try {
            const features = new APIFeatures(Contact.find(), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();

            const contacts = await features.query;

            res.json({
                status: "success",
                result: contacts.length,
                totalPages: Math.ceil(await Contact.countDocuments().exec() / req.query.limit),
                contacts: contacts,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    getContact: async (req, res) => {
        try {
            const contact = await Contact.findById(req.params.id);
            res.json(contact);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    createContact: async (req, res) => {
        try {
            const { name, email, phone, title, content } = req.body;

            const newContact = new Contact({
                name,
                email,
                phone,
                title,
                content,
            });

            await newContact.save();
            res.json({ msg: "Created a contact" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateContact: async (req, res) => {
        try {
            const { status } = req.body;

            await Contact.findOneAndUpdate(
                { _id: req.params.id },
                {
                    status,
                }
            );

            const contact = await Contact.findById(req.params.id);

            res.json({ msg: "Updated a contact", contact });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    deleteContact: async (req, res) => {
        try {
            await Contact.findByIdAndDelete(req.params.id);
            res.json({ msg: "Deleted a contact" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = contactCtrl;