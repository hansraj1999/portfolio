# Frontend Deployment Guide

This guide shows how to deploy your portfolio frontend for free.

## Quick Deploy Options

### Option 1: Netlify (Recommended - Easiest)

1. **Sign up**: Go to [netlify.com](https://netlify.com) and sign up (free)

2. **Deploy**:
   - **Method A - Drag & Drop**:
     - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
     - Drag your entire project folder (excluding `backend/` folder)
     - Wait for deployment
   
   - **Method B - GitHub**:
     - Push your code to GitHub (excluding `backend/` folder)
     - In Netlify: "Add new site" → "Import an existing project"
     - Connect GitHub and select your repo
     - Build settings:
       - Build command: (leave empty - no build needed)
       - Publish directory: `/` (root)
     - Deploy!

3. **Update API URL**:
   - After deployment, update `API_BASE_URL` in `script.js` to your backend URL
   - Or use Netlify's environment variables

4. **Custom Domain** (Optional):
   - Domain → Add custom domain
   - Follow DNS setup instructions

**Your site will be live at**: `https://your-site-name.netlify.app`

---

### Option 2: Vercel (Also Great)

1. **Sign up**: Go to [vercel.com](https://vercel.com) and sign up (free)

2. **Deploy**:
   - Click "Add New Project"
   - Import from GitHub or upload files
   - Framework Preset: "Other"
   - Root Directory: `/` (root)
   - Build Command: (leave empty)
   - Output Directory: `/` (root)
   - Deploy!

**Your site will be live at**: `https://your-site-name.vercel.app`

---

### Option 3: GitHub Pages

1. **Create GitHub repo**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/portfolio.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repo → Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main` / `root`
   - Save

3. **Update API URL** in `script.js` if needed

**Your site will be live at**: `https://yourusername.github.io/portfolio`

---

## Files to Deploy

Deploy these files/folders:
- ✅ `index.html`
- ✅ `blogs.html`
- ✅ `navbar.html`
- ✅ `footer.html`
- ✅ `script.js`
- ✅ `styles.css`
- ✅ `config.js`
- ✅ `favicon.svg`
- ✅ `IMG_1060.JPEG`
- ✅ `Hansraj_Deghun_SDE3.pdf` (if you want it downloadable)
- ✅ `_redirects` or `netlify.toml` (for Netlify)
- ✅ `vercel.json` (for Vercel)
- ✅ `.htaccess` (for Apache servers)

**Do NOT deploy**:
- ❌ `backend/` folder
- ❌ `.env` files
- ❌ `__pycache__/` folders
- ❌ `.git/` folder

## Clean URLs (No index.html in URL)

The configuration files (`_redirects`, `netlify.toml`, `vercel.json`, `.htaccess`) will automatically:
- Redirect `/index.html` → `/` (root domain)
- Serve `index.html` when accessing the root URL
- Keep URLs clean without showing `index.html`

---

## Update API URL After Deployment

After deploying, make sure your `script.js` has the correct API URL:

```javascript
const API_BASE_URL = 'https://portfolio-948422802071.asia-southeast1.run.app/api';
```

This should already be set correctly for your backend.

---

## Recommended: Netlify

**Why Netlify?**
- ✅ Easiest to use (drag & drop)
- ✅ Free HTTPS
- ✅ Free custom domain
- ✅ Fast CDN
- ✅ Continuous deployment from GitHub
- ✅ Environment variables support
- ✅ Form handling (if needed later)

**Quick Start**:
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your project folder (without `backend/`)
3. Done! Your site is live in seconds.

---

## Troubleshooting

### CORS Issues
If you get CORS errors, make sure:
- Your backend CORS is configured to allow your frontend domain
- The API URL in `script.js` is correct

### 404 Errors
- Make sure `index.html` is in the root directory
- Check that all file paths are relative (not absolute)

### Images Not Loading
- Ensure image files are included in deployment
- Check file paths in HTML/CSS are correct

