# Quick Start Guide

Get your Shopify Medical Verification System running in 5 minutes!

## Prerequisites

You need:
- Shopify Client ID
- Shopify Client Secret
- Resend API Key

## Step 1: Get Access Token (1 minute)

Run this command with YOUR credentials:

\`\`\`bash
curl -X POST \
  "https://paddys-demo.myshopify.com/admin/oauth/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
\`\`\`

Copy the `access_token` from the response.

## Step 2: Create .env File (2 minutes)

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and fill in:

\`\`\`env
SHOPIFY_STORE_URL=paddys-demo.myshopify.com
SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CLIENT_SECRET=your_client_secret
SHOPIFY_ACCESS_TOKEN=paste_from_step_1
RESEND_API_KEY=your_resend_key
PORT=3000
NODE_ENV=development
VERIFICATION_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=http://localhost:3000
\`\`\`

## Step 3: Start Server (30 seconds)

\`\`\`bash
npm start
\`\`\`

You should see:
\`\`\`
🚀 Shopify Verification Server running on port 3000
📍 Environment: development
🏪 Shopify Store: paddys-demo.myshopify.com
\`\`\`

## Step 4: Test It! (1 minute)

### Open Admin Panel
Visit: http://localhost:3000/api/admin

### Test Signup API
\`\`\`bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Doctor",
    "email": "berginpadraic@gmail.com",
    "phone": "541-555-1234",
    "npi": "1234567890"
  }'
\`\`\`

### Check Your Email
You should receive a verification email!

## Step 5: Complete Flow

1. Click the link in your email
2. Upload a test license (any JPG/PNG/PDF)
3. Refresh the admin panel
4. See your verification waiting for review
5. Click "Approve"
6. Check Shopify admin - customer should have "verified" tag!

## What's Next?

### Deploy to Railway

\`\`\`bash
# 1. Initialize git
git init
git add .
git commit -m "Initial commit"

# 2. Push to GitHub
git remote add origin YOUR_REPO_URL
git push -u origin main

# 3. Deploy on Railway
- Connect your GitHub repo
- Add environment variables
- Deploy!
\`\`\`

### Integrate with Shopify Theme

Check [README.md](README.md) for theme integration examples.

## Troubleshooting

### "Access token invalid"
→ Regenerate token in Step 1

### "Email not sending"
→ Check your Resend API key

### Port already in use
→ Change PORT in `.env` to 3001

### Can't see customer in Shopify
→ Check you're logged into the correct store

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/signup` | POST | Create customer |
| `/api/verify-email` | GET | Verify email |
| `/api/upload` | POST | Upload license |
| `/api/admin` | GET | Admin panel |
| `/api/admin/approve` | POST | Approve verification |
| `/api/admin/reject` | POST | Reject verification |

## Need Help?

Check the full [README.md](README.md) or [SETUP-CHECKLIST.md](SETUP-CHECKLIST.md)

## Files You Created

✅ [server.js](server.js) - Main server
✅ [routes/signup.js](routes/signup.js) - Customer registration
✅ [routes/verify-email.js](routes/verify-email.js) - Email verification
✅ [routes/upload-license.js](routes/upload-license.js) - File upload
✅ [routes/admin.js](routes/admin.js) - Admin panel
✅ [utils/shopify.js](utils/shopify.js) - Shopify API client

---

**You're all set! 🎉**
