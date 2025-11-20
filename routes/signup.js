const express = require('express');
const crypto = require('crypto');
const { Resend } = require('resend');
const shopifyClient = require('../utils/shopify');

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

function validateNPI(npi) {
  const npiString = String(npi).replace(/\s/g, '');

  if (!/^\d{10}$/.test(npiString)) {
    return { valid: false, error: 'NPI must be exactly 10 digits' };
  }

  return { valid: true, npi: npiString };
}

function generateVerificationToken(customerId) {
  const payload = JSON.stringify({
    customerId,
    timestamp: Date.now(),
  });

  const hmac = crypto.createHmac('sha256', process.env.VERIFICATION_SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');

  return Buffer.from(`${payload}.${signature}`).toString('base64url');
}

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, company, email, phone, address1, address2, city, province, zip, country, npi } = req.body;

    if (!firstName || !lastName || !company || !email || !npi) {
      return res.status(400).json({
        error: 'Missing required fields: firstName, lastName, company, email, npi',
      });
    }

    const npiValidation = validateNPI(npi);
    if (!npiValidation.valid) {
      return res.status(400).json({ error: npiValidation.error });
    }

    const existingCustomer = await shopifyClient.searchCustomers(`email:${email}`);
    if (existingCustomer.customers && existingCustomer.customers.length > 0) {
      return res.status(409).json({
        error: 'An account with this email already exists',
      });
    }

    const customerData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      tags: 'pending_verification',
      verified_email: false,
      note: `NPI: ${npiValidation.npi} | Company: ${company}`,
    };

    if (phone && phone.trim()) {
      customerData.phone = phone;
    }

    if (address1 || city || province || zip || country) {
      customerData.addresses = [{
        address1: address1 || '',
        address2: address2 || '',
        city: city || '',
        province: province || '',
        zip: zip || '',
        country: country || 'US',
        company: company || '',
      }];
    }

    const result = await shopifyClient.createCustomer(customerData);
    const customerId = result.customer.id;

    await shopifyClient.setCustomerMetafield(customerId, 'npi', npiValidation.npi);
    await shopifyClient.setCustomerMetafield(customerId, 'verification_status', 'email_pending');

    const verificationToken = generateVerificationToken(customerId);
    const verificationUrl = `${process.env.FRONTEND_URL}/api/verify-email?token=${verificationToken}`;

    await resend.emails.send({
      from: 'Verification <noreply@paddydemo12345678.xyz>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
              <h2 style="color: #2c3e50; margin-top: 0;">Welcome, ${firstName}!</h2>
              <p>Thank you for registering. Please verify your email address to continue with your medical license verification.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}"
                   style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="color: #3498db; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your address.',
      customerId: customerId,
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error.message.includes('Shopify API error')) {
      return res.status(502).json({
        error: 'Failed to create customer account',
        details: error.message,
      });
    }

    res.status(500).json({
      error: 'Failed to create account',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
