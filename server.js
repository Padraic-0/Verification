require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const signupRouter = require('./routes/signup');
const verifyEmailRouter = require('./routes/verify-email');
const uploadRouter = require('./routes/upload-license');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/signup', signupRouter);
app.use('/api/verify-email', verifyEmailRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Shopify Verification Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏪 Shopify Store: ${process.env.SHOPIFY_STORE_URL}`);
});
