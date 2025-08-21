const express = require('express');
const multer = require('multer');
const { configureCloudinary, uploadBase64Image } = require('../services/imageService');

const router = express.Router();

// Use memory storage; we will convert buffers to base64
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/uploads/images
// Accepts multipart/form-data with field name "images" (one or many)
router.post('/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    configureCloudinary();

    const results = await Promise.all(
      req.files.map((file) => {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        return uploadBase64Image(base64, process.env.CLOUDINARY_UPLOAD_FOLDER);
      })
    );

    res.json({
      success: true,
      images: results.map((r) => ({ url: r.url, publicId: r.publicId }))
    });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

module.exports = router;


