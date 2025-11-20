# Setup Checklist

Follow these steps to get your Shopify Medical Verification System up and running.

## Prerequisites

- [ ] Shopify store created (paddys-demo.myshopify.com)
- [ ] Shopify app created in Partner Dashboard
- [ ] App installed to your store
- [ ] Resend account created
- [ ] Railway account created (for deployment)

## Step 1: Generate Shopify Access Token

- [ ] Run this command in your terminal (replace YOUR_CLIENT_ID and YOUR_CLIENT_SECRET):

\`\`\`bash
curl -X POST \
  "https://paddys-demo.myshopify.com/admin/oauth/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
\`\`\`

- [ ] Copy the `access_token` from the response
- [ ] Save it somewhere safe

## Step 2: Configure Environment Variables

- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all required values:
  - [ ] `SHOPIFY_STORE_URL` (your store domain)
  - [ ] `SHOPIFY_CLIENT_ID` (from Shopify Partner Dashboard)
  - [ ] `SHOPIFY_CLIENT_SECRET` (from Shopify Partner Dashboard)
  - [ ] `SHOPIFY_ACCESS_TOKEN` (from Step 1)
  - [ ] `RESEND_API_KEY` (from Resend dashboard)
  - [ ] `VERIFICATION_SECRET` (generate random string: `openssl rand -hex 32`)
  - [ ] `FRONTEND_URL` (keep as localhost for now)

## Step 3: Test Locally

- [ ] Start the server: `npm start`
- [ ] Verify health endpoint: `curl http://localhost:3000/health`
- [ ] Run test script: `./test-api.sh` (requires `jq` installed)
- [ ] Open admin panel: `http://localhost:3000/api/admin`
- [ ] Test complete signup flow:
  1. [ ] Call signup API with test data
  2. [ ] Check email for verification link
  3. [ ] Click verification link
  4. [ ] Upload test license
  5. [ ] Review in admin panel
  6. [ ] Approve/reject verification

## Step 4: Deploy to Railway

- [ ] Initialize Git repository:
  \`\`\`bash
  git init
  git add .
  git commit -m "Initial commit"
  \`\`\`

- [ ] Create GitHub repository
- [ ] Push code to GitHub:
  \`\`\`bash
  git remote add origin YOUR_REPO_URL
  git push -u origin main
  \`\`\`

- [ ] Create new Railway project
- [ ] Connect Railway to GitHub repository
- [ ] Add all environment variables in Railway dashboard
- [ ] Deploy and wait for deployment to complete
- [ ] Copy Railway URL (e.g., `https://your-app.up.railway.app`)

## Step 5: Update Configuration

- [ ] Update `.env` with Railway URL:
  \`\`\`
  FRONTEND_URL=https://your-app.up.railway.app
  \`\`\`

- [ ] Commit and push changes:
  \`\`\`bash
  git add .env
  git commit -m "Update frontend URL"
  git push
  \`\`\`

- [ ] Railway will auto-deploy

## Step 6: Update Shopify App Settings

- [ ] Go to Shopify Partner Dashboard
- [ ] Edit your app configuration
- [ ] Update App URL to Railway URL
- [ ] Update Allowed redirection URL(s):
  - Add: `https://your-app.up.railway.app/api/verify-email`
- [ ] Save changes

## Step 7: Test Production

- [ ] Test signup with real email
- [ ] Verify email delivery
- [ ] Test upload flow
- [ ] Check admin panel at: `https://your-app.up.railway.app/api/admin`
- [ ] Test approval/rejection
- [ ] Verify customer tags in Shopify admin

## Step 8: Shopify Theme Integration (Optional)

To fully integrate with your store:

- [ ] Create custom signup page in Shopify theme
- [ ] Add NPI field to signup form
- [ ] Point form to your API endpoint
- [ ] Add verification status check on all pages
- [ ] Create "pending verification" page
- [ ] Redirect unverified customers

### Example theme code:

Check customer tag and redirect:
\`\`\`liquid
{% if customer %}
  {% unless customer.tags contains "verified" %}
    {% unless template == "page.pending-verification" %}
      <script>
        window.location.href = "/pages/pending-verification";
      </script>
    {% endunless %}
  {% endunless %}
{% endif %}
\`\`\`

## Troubleshooting

### Server won't start
- Check all environment variables are set
- Verify Node.js version (14+ required)
- Check port 3000 is not in use

### Emails not sending
- Verify Resend API key
- Check Resend dashboard for logs
- Ensure sender email is verified in Resend

### Token errors
- Regenerate access token (Step 1)
- Check client ID and secret are correct
- Verify app is installed on store

### Upload errors
- Check uploads directory exists and is writable
- Verify file size < 10MB
- Ensure file type is JPG, PNG, or PDF

### Railway deployment fails
- Check build logs in Railway
- Verify all environment variables are set
- Ensure no syntax errors in code

## Security Checklist

- [ ] Never commit `.env` file
- [ ] Keep access tokens secure
- [ ] Use HTTPS in production (Railway provides this)
- [ ] Regularly rotate verification secret
- [ ] Monitor upload directory size
- [ ] Set up log monitoring

## Next Steps After Setup

1. [ ] Test with real medical professionals
2. [ ] Monitor first few verifications
3. [ ] Adjust rejection email template based on common issues
4. [ ] Set up automated backups of customer data
5. [ ] Create admin authentication (currently open to anyone)
6. [ ] Add webhook for real-time customer updates

## Support

If you need help:
- Check server logs
- Review Railway deployment logs
- Check Shopify API logs in Partner Dashboard
- Review Resend email logs

---

**Last Updated:** November 2024
