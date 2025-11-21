# Shopify Theme Files

Upload these files to your Shopify theme:

## Directory Structure

```
sections/
  ├── auth-gate.liquid          - Authentication gate (login/signup overlay)
  └── pending-page.liquid       - Verification status page section

templates/
  └── page.verification-pending.json - Template for pending page

layout/
  └── theme.liquid              - Example theme.liquid with auth gate
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

### 2. Upload Template

- In Templates folder, click "Add a new template"
- Select "page"
- Copy contents of `templates/page.verification-pending.json` and paste
- Save

### 3. Add Auth Gate to Your Theme

- Open `layout/theme.liquid`
- Find the `<body>` tag
- Add this line right after `<body>`:

```liquid
{% section 'auth-gate' %}
```

### 4. Create Pending Page

- Go to **Pages** in Shopify Admin
- Create new page called "Verification Pending"
- In the page editor, select template: **page.verification-pending**
- Save

## What Each File Does

**auth-gate.liquid** - Shows login/signup overlay to non-verified users
**pending-page.liquid** - Shows verification status based on customer tags
**page.verification-pending.json** - Template that uses pending-page section
