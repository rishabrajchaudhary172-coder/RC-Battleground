const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, 'img-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PNG, JPG, JPEG, WEBP, GIF, SVG image files are allowed.'));
  },
});

// Single image file upload
router.post('/image', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error processing image upload' });
  }
});

// Base64 image upload fallback
router.post('/base64', authenticateToken, (req, res) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+\-]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 image format' });
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = Buffer.from(matches[2], 'base64');
    const fname = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filePath = path.join(uploadDir, fname);

    fs.writeFileSync(filePath, data);

    const imageUrl = `/uploads/${fname}`;
    res.json({ url: imageUrl, filename: fname });
  } catch (err) {
    console.error('Base64 upload error:', err);
    res.status(500).json({ error: 'Server error processing base64 image upload' });
  }
});

module.exports = router;
