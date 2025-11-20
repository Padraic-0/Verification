const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { Resend } = require('resend');
const shopifyClient = require('../utils/shopify');

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.get('/', async (req, res) => {
  try {
    const pendingCustomers = await shopifyClient.searchCustomers('tag:pending_review');

    const customers = await Promise.all(
      pendingCustomers.customers.map(async (customer) => {
        const metafields = await shopifyClient.getCustomerMetafields(customer.id);

        const metafieldsMap = {};
        metafields.metafields.forEach(field => {
          if (field.namespace === 'verification') {
            metafieldsMap[field.key] = field.value;
          }
        });

        return {
          id: customer.id,
          firstName: customer.first_name,
          lastName: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          npi: metafieldsMap.npi || 'N/A',
          licenseFilename: metafieldsMap.license_filename,
          uploadDate: metafieldsMap.license_upload_date,
          status: metafieldsMap.verification_status,
        };
      })
    );

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Verification Panel</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              background-color: #f5f5f5;
              padding: 20px;
            }
            .header {
              background-color: #2c3e50;
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin-bottom: 5px;
            }
            .stats {
              display: flex;
              gap: 15px;
              margin-bottom: 20px;
              flex-wrap: wrap;
            }
            .stat-card {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              flex: 1;
              min-width: 200px;
            }
            .stat-card h3 {
              color: #7f8c8d;
              font-size: 14px;
              margin-bottom: 10px;
            }
            .stat-card .number {
              font-size: 32px;
              font-weight: bold;
              color: #2c3e50;
            }
            .customer-grid {
              display: grid;
              gap: 20px;
            }
            .customer-card {
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .customer-header {
              background-color: #ecf0f1;
              padding: 15px 20px;
              border-bottom: 2px solid #bdc3c7;
            }
            .customer-header h2 {
              color: #2c3e50;
              margin-bottom: 5px;
            }
            .customer-id {
              color: #7f8c8d;
              font-size: 12px;
            }
            .customer-content {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              padding: 20px;
            }
            @media (max-width: 768px) {
              .customer-content {
                grid-template-columns: 1fr;
              }
            }
            .info-section {
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #ecf0f1;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: 600;
              color: #7f8c8d;
            }
            .info-value {
              color: #2c3e50;
            }
            .npi-highlight {
              background-color: #fff3cd;
              padding: 2px 8px;
              border-radius: 3px;
              font-family: monospace;
              font-weight: bold;
            }
            .license-section {
              padding: 15px;
            }
            .license-preview {
              width: 100%;
              max-height: 400px;
              object-fit: contain;
              border: 2px solid #ecf0f1;
              border-radius: 5px;
              background-color: #f9f9f9;
              cursor: pointer;
            }
            .license-preview:hover {
              border-color: #3498db;
            }
            .pdf-notice {
              background-color: #e3f2fd;
              padding: 15px;
              border-radius: 5px;
              text-align: center;
              color: #1976d2;
            }
            .pdf-notice a {
              color: #1976d2;
              font-weight: bold;
              text-decoration: none;
            }
            .pdf-notice a:hover {
              text-decoration: underline;
            }
            .action-buttons {
              display: flex;
              gap: 10px;
              padding: 20px;
              border-top: 2px solid #ecf0f1;
            }
            .btn {
              flex: 1;
              padding: 12px 24px;
              border: none;
              border-radius: 5px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
              transition: all 0.3s;
            }
            .btn:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .btn-approve {
              background-color: #27ae60;
              color: white;
            }
            .btn-approve:hover:not(:disabled) {
              background-color: #229954;
            }
            .btn-reject {
              background-color: #e74c3c;
              color: white;
            }
            .btn-reject:hover:not(:disabled) {
              background-color: #c0392b;
            }
            .empty-state {
              background: white;
              padding: 60px 20px;
              border-radius: 8px;
              text-align: center;
              color: #7f8c8d;
            }
            .empty-state-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            .modal {
              display: none;
              position: fixed;
              z-index: 1000;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0,0,0,0.9);
              justify-content: center;
              align-items: center;
            }
            .modal.active {
              display: flex;
            }
            .modal-content {
              max-width: 90%;
              max-height: 90%;
              object-fit: contain;
            }
            .modal-close {
              position: absolute;
              top: 20px;
              right: 40px;
              color: white;
              font-size: 40px;
              font-weight: bold;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 Medical Verification Admin Panel</h1>
            <p>Review and approve medical license verifications</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <h3>Pending Reviews</h3>
              <div class="number">${customers.length}</div>
            </div>
            <div class="stat-card">
              <h3>Store</h3>
              <div class="number" style="font-size: 18px; margin-top: 8px;">${process.env.SHOPIFY_STORE_URL}</div>
            </div>
          </div>

          <div class="customer-grid" id="customerGrid">
            ${customers.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <h2>All caught up!</h2>
                <p>No pending verifications at the moment.</p>
              </div>
            ` : customers.map(customer => `
              <div class="customer-card" id="customer-${customer.id}">
                <div class="customer-header">
                  <h2>${customer.firstName} ${customer.lastName}</h2>
                  <div class="customer-id">Customer ID: ${customer.id}</div>
                </div>
                <div class="customer-content">
                  <div class="info-section">
                    <h3 style="margin-bottom: 15px;">Customer Information</h3>
                    <div class="info-row">
                      <span class="info-label">Email:</span>
                      <span class="info-value">${customer.email}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Phone:</span>
                      <span class="info-value">${customer.phone || 'Not provided'}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">NPI Number:</span>
                      <span class="info-value"><span class="npi-highlight">${customer.npi}</span></span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Upload Date:</span>
                      <span class="info-value">${customer.uploadDate ? new Date(customer.uploadDate).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                  <div class="license-section">
                    <h3 style="margin-bottom: 15px;">License Document</h3>
                    ${customer.licenseFilename ? (
                      customer.licenseFilename.endsWith('.pdf') ? `
                        <div class="pdf-notice">
                          <p>📄 PDF Document</p>
                          <a href="/api/admin/view-license/${customer.licenseFilename}" target="_blank">
                            Click to view PDF in new tab
                          </a>
                        </div>
                      ` : `
                        <img src="/api/admin/view-license/${customer.licenseFilename}"
                             alt="Medical License"
                             class="license-preview"
                             onclick="openModal(this.src)">
                        <p style="text-align: center; margin-top: 10px; color: #7f8c8d; font-size: 12px;">
                          Click image to view full size
                        </p>
                      `
                    ) : '<p>No license uploaded</p>'}
                  </div>
                </div>
                <div class="action-buttons">
                  <button class="btn btn-approve"
                          onclick="processVerification('${customer.id}', 'approve')">
                    ✓ Approve
                  </button>
                  <button class="btn btn-reject"
                          onclick="processVerification('${customer.id}', 'reject')">
                    ✗ Reject
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <div id="imageModal" class="modal" onclick="closeModal()">
            <span class="modal-close">&times;</span>
            <img class="modal-content" id="modalImage">
          </div>

          <script>
            function openModal(src) {
              const modal = document.getElementById('imageModal');
              const modalImg = document.getElementById('modalImage');
              modal.classList.add('active');
              modalImg.src = src;
            }

            function closeModal() {
              const modal = document.getElementById('imageModal');
              modal.classList.remove('active');
            }

            async function processVerification(customerId, action) {
              if (!confirm(\`Are you sure you want to \${action} this verification?\`)) {
                return;
              }

              const card = document.getElementById(\`customer-\${customerId}\`);
              const buttons = card.querySelectorAll('.btn');
              buttons.forEach(btn => btn.disabled = true);

              try {
                const response = await fetch(\`/api/admin/\${action}\`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ customerId })
                });

                const result = await response.json();

                if (response.ok) {
                  card.style.opacity = '0.5';
                  card.style.transform = 'scale(0.95)';
                  card.style.transition = 'all 0.3s';

                  setTimeout(() => {
                    card.remove();

                    const remainingCards = document.querySelectorAll('.customer-card');
                    if (remainingCards.length === 0) {
                      document.getElementById('customerGrid').innerHTML = \`
                        <div class="empty-state">
                          <div class="empty-state-icon">✅</div>
                          <h2>All caught up!</h2>
                          <p>No pending verifications at the moment.</p>
                        </div>
                      \`;
                    }

                    const statNumber = document.querySelector('.stat-card .number');
                    statNumber.textContent = remainingCards.length;
                  }, 300);
                } else {
                  alert(\`Error: \${result.error}\`);
                  buttons.forEach(btn => btn.disabled = false);
                }
              } catch (error) {
                alert('Network error. Please try again.');
                buttons.forEach(btn => btn.disabled = false);
              }
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Admin panel error:', error);
    res.status(500).send('Error loading admin panel');
  }
});

router.get('/view-license/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    await fs.access(filePath);

    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf'
    };

    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.sendFile(filePath);
  } catch (error) {
    res.status(404).send('File not found');
  }
});

router.post('/approve', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const metafields = await shopifyClient.getCustomerMetafields(customerId);

    const licenseFilename = metafields.metafields.find(
      m => m.namespace === 'verification' && m.key === 'license_filename'
    )?.value;

    await shopifyClient.removeCustomerTag(customerId, 'pending_review');
    await shopifyClient.tagCustomer(customerId, 'verified');

    await shopifyClient.setCustomerMetafield(customerId, 'verification_status', 'approved');
    await shopifyClient.setCustomerMetafield(customerId, 'approval_date', new Date().toISOString());

    if (licenseFilename) {
      const filePath = path.join(__dirname, '../uploads', licenseFilename);
      await fs.unlink(filePath).catch(err => console.error('File deletion error:', err));
    }

    // Send Shopify account activation email so customer can set password and login
    await shopifyClient.sendAccountActivationEmail(customerId);

    res.json({ success: true, message: 'Customer approved and activation email sent' });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Failed to approve customer' });
  }
});

router.post('/reject', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const customer = await shopifyClient.getCustomer(customerId);
    const metafields = await shopifyClient.getCustomerMetafields(customerId);

    const licenseFilename = metafields.metafields.find(
      m => m.namespace === 'verification' && m.key === 'license_filename'
    )?.value;

    await shopifyClient.removeCustomerTag(customerId, 'pending_review');
    await shopifyClient.tagCustomer(customerId, 'rejected');

    await shopifyClient.setCustomerMetafield(customerId, 'verification_status', 'rejected');
    await shopifyClient.setCustomerMetafield(customerId, 'rejection_date', new Date().toISOString());

    if (licenseFilename) {
      const filePath = path.join(__dirname, '../uploads', licenseFilename);
      await fs.unlink(filePath).catch(err => console.error('File deletion error:', err));
    }

    await resend.emails.send({
      from: 'Verification <noreply@paddydemo12345678.xyz>',
      to: customer.customer.email,
      subject: 'Verification Update Required',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Verification Update</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; border-left: 4px solid #ffc107;">
              <h2 style="color: #856404; margin-top: 0;">Verification Update Required</h2>
              <p>Hello ${customer.customer.first_name},</p>
              <p>We were unable to verify your medical license with the documentation provided.</p>
              <p><strong>Common reasons for rejection:</strong></p>
              <ul>
                <li>License does not match the name on your account</li>
                <li>NPI number not visible or does not match</li>
                <li>Document quality is too poor to read</li>
                <li>License appears to be expired</li>
              </ul>
              <p>Please contact our support team for assistance or to resubmit your verification.</p>
            </div>
          </body>
        </html>
      `,
    });

    res.json({ success: true, message: 'Customer rejected successfully' });
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ error: 'Failed to reject customer' });
  }
});

module.exports = router;
