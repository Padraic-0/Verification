const express = require('express');
const crypto = require('crypto');
const shopifyClient = require('../utils/shopify');

const router = express.Router();

function verifyToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [payload, signature] = decoded.split('.');

    const hmac = crypto.createHmac('sha256', process.env.VERIFICATION_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const data = JSON.parse(payload);

    const tokenAge = Date.now() - data.timestamp;
    const maxAge = 24 * 60 * 60 * 1000;

    if (tokenAge > maxAge) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, customerId: data.customerId };
  } catch (error) {
    return { valid: false, error: 'Invalid token format' };
  }
}

router.get('/', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Verification Error</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { color: #e74c3c; }
            </style>
          </head>
          <body>
            <h1 class="error">Verification Error</h1>
            <p>No verification token provided.</p>
          </body>
        </html>
      `);
    }

    const validation = verifyToken(token);

    if (!validation.valid) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Verification Error</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { color: #e74c3c; }
            </style>
          </head>
          <body>
            <h1 class="error">Verification Failed</h1>
            <p>${validation.error}</p>
            <p>Please contact support or request a new verification email.</p>
          </body>
        </html>
      `);
    }

    const customerId = validation.customerId;

    await shopifyClient.updateCustomer(customerId, {
      verified_email: true,
    });

    await shopifyClient.setCustomerMetafield(customerId, 'verification_status', 'email_verified');

    const customer = await shopifyClient.getCustomer(customerId);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verified</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 700px;
              margin: 50px auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #27ae60; margin-top: 0; }
            .success-icon { font-size: 48px; text-align: center; }
            .info-box {
              background-color: #e8f5e9;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .upload-form {
              margin-top: 30px;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 5px;
            }
            input[type="file"] {
              margin: 10px 0;
              padding: 10px;
              width: 100%;
              box-sizing: border-box;
            }
            button {
              background-color: #3498db;
              color: white;
              padding: 12px 30px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              font-weight: bold;
              width: 100%;
              margin-top: 10px;
            }
            button:hover { background-color: #2980b9; }
            button:disabled {
              background-color: #95a5a6;
              cursor: not-allowed;
            }
            .requirements {
              background-color: #fff3cd;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
              font-size: 14px;
            }
            .requirements ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .error-message {
              color: #e74c3c;
              margin: 10px 0;
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Email Verified Successfully!</h1>
            <div class="info-box">
              <p><strong>Welcome, ${customer.customer.first_name}!</strong></p>
              <p>Your email has been verified. Now please upload your medical license to complete the verification process.</p>
            </div>

            <div class="requirements">
              <strong>License Requirements:</strong>
              <ul>
                <li>Must clearly show your name (${customer.customer.first_name} ${customer.customer.last_name})</li>
                <li>Must display your NPI number</li>
                <li>Must be a valid medical license</li>
                <li>Accepted formats: JPG, PNG, PDF</li>
                <li>Maximum file size: 10MB</li>
              </ul>
            </div>

            <div class="upload-form">
              <h3>Upload Medical License</h3>
              <form id="uploadForm">
                <input type="file" id="licenseFile" name="license" accept=".jpg,.jpeg,.png,.pdf" required>
                <div class="error-message" id="errorMessage"></div>
                <button type="submit" id="submitBtn">Upload License</button>
              </form>
            </div>
          </div>

          <script>
            const form = document.getElementById('uploadForm');
            const fileInput = document.getElementById('licenseFile');
            const submitBtn = document.getElementById('submitBtn');
            const errorMessage = document.getElementById('errorMessage');

            form.addEventListener('submit', async (e) => {
              e.preventDefault();

              const file = fileInput.files[0];
              if (!file) {
                showError('Please select a file');
                return;
              }

              if (file.size > 10 * 1024 * 1024) {
                showError('File size must be less than 10MB');
                return;
              }

              const formData = new FormData();
              formData.append('license', file);
              formData.append('customerId', '${customerId}');

              submitBtn.disabled = true;
              submitBtn.textContent = 'Uploading...';
              errorMessage.style.display = 'none';

              try {
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData
                });

                const result = await response.json();

                if (response.ok) {
                  document.querySelector('.container').innerHTML = \`
                    <div class="success-icon">🎉</div>
                    <h1>Upload Successful!</h1>
                    <div class="info-box">
                      <p><strong>Thank you for uploading your license!</strong></p>
                      <p>Your application is now under review. You will receive an email notification once the verification is complete.</p>
                      <p>This typically takes 1-2 business days.</p>
                    </div>
                  \`;
                } else {
                  showError(result.error || 'Upload failed');
                  submitBtn.disabled = false;
                  submitBtn.textContent = 'Upload License';
                }
              } catch (error) {
                showError('Network error. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Upload License';
              }
            });

            function showError(message) {
              errorMessage.textContent = message;
              errorMessage.style.display = 'block';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verification Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1 class="error">Verification Error</h1>
          <p>An error occurred during verification. Please try again later.</p>
        </body>
      </html>
    `);
  }
});

module.exports = router;
