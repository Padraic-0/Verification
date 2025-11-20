# Shopify Theme Setup Guide

Follow these steps to complete your medical verification system.

## ✅ What You've Done So Far

1. Backend deployed to Railway
2. Environment variables configured
3. Signup page code ready
4. Pending page code ready
5. Theme verification code ready

## 🎯 Final Steps

### Step 1: Create Signup Page

1. **Go to Shopify Admin** → Online Store → Pages
2. Click **"Add page"**
3. **Title**: `Medical Professional Signup`
4. Click **"Show HTML"** (top right corner)
5. Copy **ALL** content from `shopify-signup-page.liquid`
6. Paste into HTML editor
7. **Save**

**Your signup page will be at:**
```
https://paddys-demo.myshopify.com/pages/medical-professional-signup
```

### Step 2: Create Pending/Status Page

1. **Go to Shopify Admin** → Online Store → Pages
2. Click **"Add page"**
3. **Title**: `Verification Pending`
4. Click **"Show HTML"**
5. Copy **ALL** content from `shopify-pending-page.liquid`
6. Paste into HTML editor
7. **Save**

**Your pending page will be at:**
```
https://paddys-demo.myshopify.com/pages/verification-pending
```

### Step 3: Add Verification Check to Theme

1. **Go to Shopify Admin** → Online Store → Themes
2. Click **"Customize"** on your active theme
3. Click the **three dots (...)** → **"Edit code"**
4. In the left sidebar, find **"theme.liquid"** (under Layout folder)
5. Find the `<body>` tag (usually around line 100-150)
6. **Paste the code from `theme-verification-code.liquid` RIGHT AFTER the `<body>` tag**
7. **Save**

**Example of where to paste:**
```liquid
<body class="{% if customer %}customer-logged-in{% endif %}">

  {% comment %} PASTE THE VERIFICATION CODE HERE {% endcomment %}

  {% section 'header' %}
  ... rest of your theme
```

### Step 4: Test the System

#### Test 1: Not Logged In
1. Visit your store homepage: `https://paddys-demo.myshopify.com`
2. **Expected**: Redirected to signup page

#### Test 2: Create Account
1. Fill out the signup form
2. **Expected**: Email sent, success message shown

#### Test 3: Verify Email
1. Check your email inbox
2. Click verification link
3. **Expected**: Upload form shown

#### Test 4: Upload License
1. Upload a test image or PDF
2. **Expected**: Success message, redirected to pending page

#### Test 5: Check Pending Status
1. Log in to your store
2. **Expected**: Redirected to pending page with status

#### Test 6: Admin Review
1. Visit: `https://verification-production-3ad5.up.railway.app/api/admin`
2. **Expected**: See pending verification
3. Click **"Approve"**
4. **Expected**: Customer gets approval email

#### Test 7: Verified Access
1. Log in as the approved customer
2. Visit your store
3. **Expected**: Full access to shop!

## 🔧 Customization

### Change Support Email

In both page templates, replace `support@yourstore.com` with your actual support email.

### Customize Colors

The signup page uses these colors:
- Primary gradient: `#667eea` to `#764ba2`
- Success: `#27ae60`
- Error: `#e74c3c`

Search for these hex codes in the Liquid files to change them.

### Add Your Logo

Add this to the signup/pending pages after the opening `<div>`:
```html
<img src="YOUR_LOGO_URL" alt="Logo" style="max-width: 200px; margin-bottom: 20px;">
```

## 📊 Admin Panel

Access your admin panel anytime at:
```
https://verification-production-3ad5.up.railway.app/api/admin
```

Features:
- View all pending verifications
- See customer info and NPI
- Preview uploaded licenses
- Approve or reject with one click
- Automatic email notifications

## 🎫 Customer Tags

The system uses these tags:

| Tag | Meaning |
|-----|---------|
| `pending_verification` | Email not verified yet |
| `pending_review` | License uploaded, awaiting review |
| `verified` | ✅ Approved - can shop |
| `rejected` | ❌ Rejected - cannot shop |

## 🔍 Troubleshooting

### Customers Not Redirecting
- Check that theme code is pasted after `<body>` tag
- Clear browser cache
- Check that pages are published

### Signup Form Not Working
- Verify Railway is running: visit `/health` endpoint
- Check browser console for errors
- Verify `BACKEND_URL` is correct in signup page

### Emails Not Sending
- Check Resend dashboard for logs
- Verify `RESEND_API_KEY` in Railway variables
- Check spam folder

### Admin Panel Not Loading
- Verify Railway environment variables are set
- Check Railway logs for errors
- Ensure `SHOPIFY_ACCESS_TOKEN` is valid

## 🚀 You're Done!

Your medical verification system is complete:

✅ Beautiful signup form
✅ Email verification
✅ License upload
✅ Admin review panel
✅ Automatic customer tagging
✅ Store access control

Customers can only shop after you approve them!
