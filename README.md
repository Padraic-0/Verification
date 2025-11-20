# Shopify Medical Verification System

A complete backend system for verifying medical professionals before allowing them to shop on a Shopify store. Customers must verify their NPI number and upload a medical license for manual review.

## Features

- ✅ Customer registration with NPI validation
- ✅ Email verification flow with Resend API
- ✅ Medical license upload (images & PDFs)
- ✅ Beautiful admin review panel
- ✅ Automatic Shopify customer tagging
- ✅ Secure token-based verification
- ✅ Automatic access token refresh
- ✅ Document auto-deletion after review

## Project Structure

```
shopify-verification-backend/
├── routes/
│   ├── signup.js           # Customer registration with NPI
│   ├── verify-email.js     # Email verification handler
│   ├── upload-license.js   # Document upload endpoint
│   └── admin.js            # Admin review panel
├── utils/
│   └── shopify.js          # Shopify API client with token refresh
├── uploads/                # Temporary file storage (auto-cleanup)
├── server.js               # Main Express server
├── package.json            # Dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Setup Instructions

### 1. Generate Shopify Access Token

First, you need to generate an access token from your Shopify app:

\`\`\`bash
curl -X POST \\
  "https://paddys-demo.myshopify.com/admin/oauth/access_token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET"
\`\`\`

Save the `access_token` from the response.

### 2. Set Up Environment Variables

Copy the example environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your actual credentials:

\`\`\`env
# Shopify Configuration
SHOPIFY_STORE_URL=paddys-demo.myshopify.com
SHOPIFY_CLIENT_ID=your_actual_client_id
SHOPIFY_CLIENT_SECRET=your_actual_client_secret
SHOPIFY_ACCESS_TOKEN=your_access_token_from_step_1

# Resend Email API
RESEND_API_KEY=your_resend_api_key

# Server Configuration
PORT=3000
NODE_ENV=development

# Security (generate a random string)
VERIFICATION_SECRET=your_random_secret_here

# Frontend URL (update after deploying to Railway)
FRONTEND_URL=http://localhost:3000
\`\`\`

### 3. Install Dependencies

Dependencies are already installed, but if needed:

\`\`\`bash
npm install
\`\`\`

### 4. Test Locally

Start the server:

\`\`\`bash
npm start
\`\`\`

The server will run on `http://localhost:3000`

Test the health endpoint:

\`\`\`bash
curl http://localhost:3000/health
\`\`\`

### 5. Deploy to Railway

1. Initialize Git (if not already):
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   \`\`\`

2. Push to GitHub:
   \`\`\`bash
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   \`\`\`

3. In Railway:
   - Create new project
   - Connect to your GitHub repository
   - Add environment variables (copy from `.env`)
   - Deploy automatically

4. Update `.env` with Railway URL:
   \`\`\`
   FRONTEND_URL=https://your-app.up.railway.app
   \`\`\`

5. Redeploy Railway project

## API Endpoints

### POST `/api/signup`

Register a new customer with NPI.

**Request Body:**
\`\`\`json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "npi": "1234567890"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your address.",
  "customerId": 123456789
}
\`\`\`

### GET `/api/verify-email?token=xxx`

Verify customer email and show upload form.

### POST `/api/upload`

Upload medical license (multipart/form-data).

**Form Data:**
- `license`: File (image or PDF, max 10MB)
- `customerId`: Shopify customer ID

### GET `/api/admin`

Admin panel to review pending verifications.

### POST `/api/admin/approve`

Approve a verification.

**Request Body:**
\`\`\`json
{
  "customerId": 123456789
}
\`\`\`

### POST `/api/admin/reject`

Reject a verification.

**Request Body:**
\`\`\`json
{
  "customerId": 123456789
}
\`\`\`

## Customer Flow

1. **Registration** → Customer creates account with NPI
2. **Email Sent** → Verification email sent via Resend
3. **Email Verified** → Customer clicks link and sees upload form
4. **License Upload** → Customer uploads medical license
5. **Admin Review** → You review at `/api/admin`
6. **Approval** → Customer tagged "verified" in Shopify
7. **Email Sent** → Approval/rejection email sent

## Shopify Tags

The system uses these customer tags:

- `pending_verification` - Account created, email not verified
- `pending_review` - License uploaded, waiting for admin review
- `verified` - Approved by admin, can access store
- `rejected` - Rejected by admin

## Customer Metafields

Stored in namespace `verification`:

- `npi` - Customer's NPI number
- `verification_status` - Current status
- `license_filename` - Uploaded file name
- `license_upload_date` - Upload timestamp
- `approval_date` - Approval timestamp
- `rejection_date` - Rejection timestamp

## Security Features

- NPI validation (10 digits only)
- HMAC-signed verification tokens
- Token expiry (24 hours)
- File type validation
- File size limits (10MB)
- Automatic file deletion after review
- CORS protection
- Environment variable configuration

## Testing the System

### Test Signup

\`\`\`bash
curl -X POST http://localhost:3000/api/signup \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Test",
    "lastName": "Doctor",
    "email": "test@example.com",
    "phone": "555-1234",
    "npi": "1234567890"
  }'
\`\`\`

### Access Admin Panel

Open in browser: `http://localhost:3000/api/admin`

## Troubleshooting

### Token Refresh Issues

The system automatically refreshes Shopify access tokens. If you see token errors:

1. Check your `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET`
2. Regenerate access token manually
3. Update `.env` file

### Email Not Sending

1. Verify `RESEND_API_KEY` is correct
2. Check Resend dashboard for logs
3. Make sure sender email is verified

### File Upload Errors

1. Check `uploads/` directory exists and is writable
2. Verify file size is under 10MB
3. Ensure file type is JPG, PNG, or PDF

## Next Steps

After backend is deployed:

1. Update Shopify app URLs in Partner Dashboard
2. Modify Shopify theme to check customer tags
3. Add custom signup form to theme
4. Create "pending verification" page
5. Test complete flow end-to-end

## Support

For issues or questions, check:
- Server logs for errors
- Shopify API logs
- Resend email logs
- Railway deployment logs

## License

ISC
