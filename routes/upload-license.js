const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const shopifyClient = require('../utils/shopify');

const router = express.Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `license-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});

router.post('/', upload.single('license'), async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const customer = await shopifyClient.getCustomer(customerId);

    if (!customer.customer) {
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(404).json({ error: 'Customer not found' });
    }

    await shopifyClient.setCustomerMetafield(customerId, 'verification_status', 'license_uploaded');
    await shopifyClient.setCustomerMetafield(customerId, 'license_filename', req.file.filename);
    await shopifyClient.setCustomerMetafield(customerId, 'license_upload_date', new Date().toISOString());

    await shopifyClient.removeCustomerTag(customerId, 'pending_verification');
    await shopifyClient.tagCustomer(customerId, 'pending_review');

    res.status(200).json({
      success: true,
      message: 'License uploaded successfully',
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Upload error:', error);

    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 10MB limit' });
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Failed to upload license',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
