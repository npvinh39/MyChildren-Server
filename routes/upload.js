//...
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');
const fs = require('fs');

const router = express.Router();

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình Multer cho tải lên
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload multiple images - only admin can use
router.post('/upload', auth, authAdmin, upload.array('files', 10), async (req, res) => {
    try {
        const file = req.files;
        if (!file) return res.status(400).json({ msg: 'No files were uploaded.' })

        const promises = file.map(file => new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload_stream({ resource_type: 'auto', folder: 'MyChildren' }, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }).end(file.buffer)
        }
        ))

        const results = await Promise.all(promises);
        res.json(
            results.map(result => ({ public_id: result.public_id, url: result.secure_url }))
        );

    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
});

// Delete image only admin can use
router.post('/destroy', auth, authAdmin, async (req, res) => {
    try {
        const { public_id } = req.body;
        if (!public_id) return res.status(400).json({ msg: 'No images Selected' })

        await cloudinary.v2.uploader.destroy(public_id);
        res.json({ msg: "Deleted Image" });

    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
});

router.post('/success', async (req, res) => {
    res.json({ success: true });
});

const removeTmp = (path) => {
    return new Promise((resolve, reject) => {
        fs.unlink(path, err => {
            if (err) reject(err);
            else resolve();
        })
    })
}

module.exports = router;
