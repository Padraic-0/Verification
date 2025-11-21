# Shopify Theme Files

Upload these files to your Shopify theme:

## Directory Structure

```
sections/
  ├── auth-gate.liquid             - Authentication gate (login/signup overlay)
  ├── pending-page.liquid          - Verification status page section
  └── verification-signup.liquid   - Signup form with NPI validation

templates/
  ├── page.verification-pending.json - Template for pending page
  └── page.verification-signup.json  - Template for signup page

layout/
  └── theme.liquid                 - Example theme.liquid with auth gate
```

## Installation

### 1. Upload Sections

Go to: **Shopify Admin → Themes → Edit Code**

- Click "Add a new section"
- Copy contents of `sections/auth-gate.liquid` and paste
- Save as `auth-gate`

- Click "Add a new section"
- Copy contents of `sections/pending-page.liquid` and paste
- Save as `pending-page`

- Click "Add a new section"
- Copy contents of `sections/verification-signup.liquid` and paste
- Save as `verification-signup`

### 2. Upload Templates

- In Templates folder, click "Add a new template"
- Select "page"
- Copy contents of `templates/page.verification-pending.json` and paste
- Save as `page.verification-pending`

- Click "Add a new template"
- Select "page"
- Copy contents of `templates/page.verification-signup.json` and paste
- Save as `page.verification-signup`

### 3. Add Auth Gate to Your Theme

- Open `layout/theme.liquid`
- Find the `<body>` tag
- Add this line right after `<body>`:

```liquid
{% section 'auth-gate' %}
```

### 4. Create Pages

- Go to **Pages** in Shopify Admin
- Create new page called "Verification Pending"
- In the page editor, select template: **page.verification-pending**
- Save

- Create new page called "Verification Signup"
- In the page editor, select template: **page.verification-signup**
- Save

## What Each File Does

**auth-gate.liquid** - Shows login/signup overlay to non-verified users with buttons linking to signup page and Shopify native login
**pending-page.liquid** - Shows verification status based on customer tags (pending, verified, rejected)
**verification-signup.liquid** - Full NPI verification form that submits to Railway backend
**page.verification-pending.json** - Template that uses pending-page section
**page.verification-signup.json** - Template that uses verification-signup section

## Complete Verification Flow

1. Non-verified visitor sees auth-gate card with "Sign Up for Verification" and "Log In" buttons
2. Click "Sign Up" → Goes to /pages/verification-signup
3. Fill out form with NPI, name, company, address → Submits to Railway backend
4. Backend creates Shopify account with `pending_verification` tag
5. User receives email with verification link
6. After email verification, user uploads medical license
7. Backend updates tag to `pending_review`
8. Admin logs in at `/api/admin` with credentials from .env
9. Admin verifies NPI matches license and clicks approve
10. Backend updates tag to `verified` and sends Shopify account activation email
11. User clicks activation link, sets password
12. User can now login with Shopify's passwordless email code system
