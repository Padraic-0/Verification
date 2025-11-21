# Deployment Checklist

## Backend (Railway) - ✅ Already Deployed

Your Railway backend is already deployed at:
**https://verification-production-3ad5.up.railway.app**

Environment variables should already be configured in Railway dashboard.

## Shopify Theme Files - Need to Upload

### Step 1: Upload Sections

Go to **Shopify Admin → Themes → Edit Code → Sections**

Upload these 3 sections:

1. **auth-gate** - Copy `shopify-theme/sections/auth-gate.liquid`
2. **pending-page** - Copy `shopify-theme/sections/pending-page.liquid`
3. **verification-signup** - Copy `shopify-theme/sections/verification-signup.liquid`

### Step 2: Upload Templates

Go to **Templates** folder in theme editor

Upload these 2 templates:

1. **page.verification-pending** - Copy `shopify-theme/templates/page.verification-pending.json`
2. **page.verification-signup** - Copy `shopify-theme/templates/page.verification-signup.json`

### Step 3: Update theme.liquid

Go to **Layout → theme.liquid**

Add this line right after the `<body>` tag:

```liquid
{% section 'auth-gate' %}
```

### Step 4: Create Pages

Go to **Shopify Admin → Pages**

Create 2 new pages:

1. **Verification Pending**
   - Title: "Verification Pending"
   - Template: `page.verification-pending`

2. **Verification Signup**
   - Title: "Verification Signup"
   - Template: `page.verification-signup`

### Step 5: Configure Customer Accounts

Go to **Settings → Customer accounts**

- Enable customer accounts
- Select "Accounts are optional" or "Accounts are required"
- For legacy password-based login after activation, use "Legacy" mode

## Testing the Complete Flow

### Test 1: New User Signup
1. Open your store in incognito mode
2. Should see auth-gate card with "Sign Up for Verification" and "Log In" buttons
3. Click "Sign Up for Verification"
4. Fill out form with test data (use valid 10-digit NPI like 1234567890)
5. Submit form
6. Check email for verification link
7. Click verification link
8. Upload test medical license image (JPG, PNG, or PDF under 10MB)

### Test 2: Admin Review
1. Go to `https://verification-production-3ad5.up.railway.app/api/admin`
2. Login with credentials from your .env file:
   - Username: `ADMIN_USERNAME`
   - Password: `ADMIN_PASSWORD`
3. Should see pending applicant
4. Verify NPI matches the license
5. Click "Approve"

### Test 3: User Activation
1. Check email for Shopify account activation
2. Click activation link
3. Set password
4. Go back to store
5. Click "Log In"
6. Enter email (Shopify will send one-time code)
7. Enter code from email
8. Should now have full access to store

## Troubleshooting

### Issue: Form submits but nothing happens
- Check browser console for errors
- Verify Railway backend is running: visit `https://verification-production-3ad5.up.railway.app/api/admin`
- Check network tab to see if POST request to `/api/signup` succeeds

### Issue: Page is all white after adding auth-gate
- Make sure you're testing as a non-logged-in user
- Check that auth-gate section is added INSIDE the `<body>` tag, not in `<head>`

### Issue: "Customer account creation has been disabled"
- Go to Settings → Customer accounts
- Enable customer accounts

### Issue: Admin panel asks for password but credentials don't work
- Check Railway environment variables
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set correctly

### Issue: Can't login after approval
- Verify account activation email was sent (check spam folder)
- Make sure customer account settings are enabled
- For passwordless login, make sure Shopify supports it in your region (US only currently)

## Environment Variables (Already Set in Railway)

```
SHOPIFY_STORE_URL=paddys-demo.myshopify.com
SHOPIFY_CLIENT_ID=...
SHOPIFY_CLIENT_SECRET=...
SHOPIFY_ACCESS_TOKEN=...
RESEND_API_KEY=...
PORT=3000
NODE_ENV=production
VERIFICATION_SECRET=...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_this_password_now
FRONTEND_URL=https://verification-production-3ad5.up.railway.app
```

## Security Notes

- Admin panel is password protected with HTTP Basic Auth
- Email verification tokens expire after 24 hours
- NPI numbers are validated as 10 digits
- Customer data is stored in Shopify (HIPAA compliant if you have Shopify Plus)
- Uploaded license files are stored temporarily on Railway
- Server-side Liquid checks prevent unauthorized page access
