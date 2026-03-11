# Deployment Checklist

## Pre-Deployment (Do These First)

### Backend Preparation
- [ ] Copy `.env.example` to `.env` in Backend folder
- [ ] Fill in all required environment variables in `.env`:
  - [ ] MongoDB URI (from MongoDB Atlas)
  - [ ] JWT_SECRET (generate random 32+ char string)
  - [ ] Cloudinary credentials
  - [ ] Gmail App Password
  - [ ] ADMIN_EMAIL and ADMIN_PASSWORD
  - [ ] FRONTEND_URL with your Netlify domain (optional for now)
- [ ] Test locally: `npm start` from Backend folder
- [ ] Verify API responds: Open `http://localhost:4000/health`
- [ ] Test admin login at `http://localhost:4000/admin-1903.html`

### Frontend Preparation
- [ ] Verify Tailwind CSS builds: `npm run tw:build` from Frontend folder
- [ ] Check `Frontend/build/main.css` exists and has content
- [ ] Update API URL in `Frontend/index.html` (add before `</head>`):
  ```html
  <script>
    window.SoulApiBase = "https://your-backend-url.onrender.com/api";
  </script>
  ```
- [ ] Do same for all other HTML files (admin-1903.html, employee-dashboard.html, etc.)
- [ ] Verify `netlify.toml` exists in Frontend folder
- [ ] Verify `package.json` build script is: `"build": "npm run tw:build"`
- [ ] Test locally with correct API: `npm run dev` from Frontend folder

### Git Setup
- [ ] Initialize git (if not already): `git init`
- [ ] Add all files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Create GitHub repository
- [ ] Push to GitHub: `git push -u origin main`

---

## Deployment Phase

### Backend Deployment on Render

**Step 1: Create Render Account**
- [ ] Go to [render.com](https://render.com)
- [ ] Sign up / Login

**Step 2: Create Web Service**
- [ ] Click "New +"
- [ ] Select "Web Service"
- [ ] Connect your GitHub repository
- [ ] Select `Backend` folder if monorepo
- [ ] Fill in:
  - Name: `soul-pharma-backend`
  - Environment: `Node`
  - Build Command: `npm install`
  - Start Command: `node index.js`
  - Instance: `Free` (or paid if production)

**Step 3: Add Environment Variables**
- [ ] In Render dashboard, go to "Environment"
- [ ] Add each variable from your `.env`:
  - MONGODB_URI
  - JWT_SECRET
  - CLOUDINARY_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
  - MAIL_HOST
  - MAIL_USER
  - MAIL_PASS
  - ADMIN_EMAIL
  - ADMIN_PASSWORD
  - NODE_ENV=production
  - FRONTEND_URL=(your Netlify URL)

**Step 4: Deploy**
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (visible in "Events" tab)
- [ ] Once deployed, note the URL: `https://soul-pharma-backend-xxxx.onrender.com`
- [ ] Test: Visit `https://your-backend-url/health` in browser

---

### Frontend Deployment on Netlify

**Step 1: Update Frontend with Backend URL**
- [ ] Replace `your-backend-url.onrender.com` with actual Render URL in all HTML files
- [ ] Example: `window.SoulApiBase = "https://soul-pharma-backend-xxxx.onrender.com/api";`
- [ ] Push to GitHub

**Step 2: Create Netlify Account**
- [ ] Go to [netlify.com](https://netlify.com)
- [ ] Sign up / Login with GitHub

**Step 3: Deploy Site**
- [ ] Click "Import from Git"
- [ ] Select your GitHub repository
- [ ] Configure:
  - Base directory: `Frontend`
  - Build command: `npm run build`
  - Publish directory: `.`
- [ ] Click "Deploy Site"

**Step 4: Verify Deployment**
- [ ] Wait for build to complete
- [ ] Preview site
- [ ] Check CSS loads (Tailwind styles visible)
- [ ] Test login and API calls

---

## Post-Deployment Testing

### Backend Tests
- [ ] API Health: `https://your-backend-url/health`
- [ ] Admin Login: Works with your credentials
- [ ] Employee Data: Can create/read employees
- [ ] News: Can create/read news
- [ ] Forms: Can submit contact form

### Frontend Tests
- [ ] Site loads on `https://your-site-name.netlify.app`
- [ ] Tailwind CSS applied everywhere
- [ ] Admin panel accessible at `/admin-1903.html`
- [ ] Employee dashboard at `/employee-dashboard.html`
- [ ] API calls work (data displays)
- [ ] Forms submit successfully
- [ ] Mobile responsive

### CORS/API Tests
- [ ] Open browser DevTools (F12)
- [ ] Go to "Console" tab
- [ ] No CORS errors
- [ ] No API errors

---

## Troubleshooting

### Backend Won't Deploy
- Check build logs in Render "Events" tab
- Verify all environment variables are set
- Check MongoDB connection string is correct
- Ensure `node_modules` matches dependencies

### Frontend Shows Blank Page
- Check browser console (F12) for errors
- Verify `build/main.css` exists
- Check `netlify.toml` is correct
- Verify redirects are working

### Tailwind CSS Not Loading
- Run `npm run tw:build` locally
- Verify `build/main.css` has content (not empty)
- Check HTML links to correct CSS path: `build/main.css`
- Verify Netlify build logs show "npm run build" running

### API Not Responding
- Check backend is running (Render events tab)
- Verify environment variables set in Render
- Check MongoDB connection works locally first
- In Render dashboard, restart the service

### CORS Errors
- Backend URL must be added to CORS origins
- Netlify URL must be in `FRONTEND_URL` env variable
- Restart backend after changing CORS config

---

## URLs After Deployment

Replace with your actual URLs:

| Service | URL |
|---------|-----|
| Backend | `https://soul-pharma-backend-xxxx.onrender.com` |
| Backend Health | `https://soul-pharma-backend-xxxx.onrender.com/health` |
| Frontend | `https://your-site-name.netlify.app` |
| Admin Panel | `https://your-site-name.netlify.app/admin-1903.html` |
| Employee Dashboard | `https://your-site-name.netlify.app/employee-dashboard.html` |

---

## Important Reminders

⚠️ **Free Tier Notes:**
- Render: 512MB RAM, spins down after 15 min inactivity
- Netlify: Full features on free tier, good for frontend
- MongoDB Atlas: 500MB free tier (upgrade if needed)

✅ **Security:**
- Never commit `.env` files
- Use strong random JWT_SECRET
- Use App Password for Gmail (not account password)
- Check deployed sites for sensitive data

🔄 **Continuous Deployment:**
- Render auto-deploys on GitHub push
- Netlify auto-deploys on Git push
- Check deployment logs if issues

---

## Need Help?

Check these files in your project:
- `DEPLOYMENT_GUIDE.md` - Detailed guide
- `Backend/.env.example` - Environment variables template
- `Frontend/netlify.toml` - Netlify configuration
