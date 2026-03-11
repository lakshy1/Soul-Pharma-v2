# Soul Pharma - Complete Deployment Guide

## Table of Contents
1. [Backend Deployment (Render)](#backend-deployment-render)
2. [Frontend Deployment (Netlify)](#frontend-deployment-netlify)
3. [Configuration & Testing](#configuration--testing)

---

## BACKEND DEPLOYMENT (RENDER)

### Step 1: Prepare Your Backend

Before deploying, ensure your backend is ready:

1. **Install Dependencies**
   ```bash
   cd Backend
   npm install
   ```

2. **Create `.env` file** (if not already exists)
   ```
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   MAIL_HOST=smtp.gmail.com
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_app_password
   ```

3. **Update CORS in Backend** (optional, but recommended)
   - In `Backend/index.js`, ensure CORS allows Netlify domain:
   ```javascript
   app.use(cors({
     origin: ["http://localhost:3000", "https://your-netlify-domain.netlify.app"],
     credentials: true
   }));
   ```

4. **Ensure `package.json` has `start` script**
   ```json
   "scripts": {
     "start": "node index.js",
     "dev": "nodemon index.js"
   }
   ```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub or Email
3. Verify your email

### Step 3: Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (or upload code)
3. Fill in the details:
   - **Name**: `soul-pharma-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: `Free` (for testing)

4. Click **"Create Web Service"**

### Step 4: Set Environment Variables on Render

1. In your Render dashboard, go to your service
2. Click **"Environment"** tab
3. Add all your environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `MAIL_HOST`
   - `MAIL_USER`
   - `MAIL_PASS`

4. Click **"Save Changes"**

### Step 5: Deploy Backend

1. Render will automatically start deploying
2. Wait for the build to complete (visible in "Events" tab)
3. Once deployed, you'll get a URL like: `https://soul-pharma-backend.onrender.com`
4. Test your backend: Visit `https://your-backend-url/api/` in browser

**Note**: Render free tier sleeps after 15 minutes of inactivity. API calls will wake it up first (takes 30-60s).

---

## FRONTEND DEPLOYMENT (NETLIFY)

### Step 1: Prepare Your Frontend

1. **Update API Base URL** in `Frontend/assets/js/site.js`:
   ```javascript
   const apiBase = window.SoulApiBase || "https://your-backend-url.onrender.com/api";
   ```

2. **In HTML files**, also add the API base:
   ```html
   <script>
     window.SoulApiBase = "https://your-backend-url.onrender.com/api";
   </script>
   ```
   Place this before other scripts in your HTML files.

3. **Ensure `build/main.css` is generated**:
   ```bash
   cd Frontend
   npm run tw:build
   ```

4. **Commit to GitHub**:
   ```bash
   git add .
   git commit -m "Update API endpoints for production"
   git push
   ```

### Step 2: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub (recommended for auto-deployment)
3. Verify your email

### Step 3: Deploy Frontend on Netlify

#### Option A: Direct Connection (Recommended)
1. Click **"Import from Git"**
2. Select **"GitHub"** (authorize if needed)
3. Choose your repository
4. Select **Deploy settings**:
   - **Base directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.` (current directory in Frontend)
5. Click **"Deploy Site"**

#### Option B: Manual Upload
1. Click **"Deploy manually"**
2. Drag and drop the `Frontend` folder
3. Wait for deployment to complete

### Step 4: Configure Netlify Environment

1. Go to **"Site settings"** → **"Build & deploy"**
2. In **"Environment"** section, add:
   - **Key**: `API_BASE_URL`
   - **Value**: `https://your-backend-url.onrender.com/api`

3. In **"Redirects"** section, ensure `_redirects` file exists with:
   ```
   /admin-1903  /admin-1903.html  200
   /*           /index.html       200
   ```

### Step 5: Verify Deployment

1. Your site is live at: `https://your-site-name.netlify.app`
2. Check if CSS loads (should see Tailwind styles)
3. Test API calls (Overview tab should load employee data)

---

## CONFIGURATION & TESTING

### Quick Checklist

✅ **Backend (Render)**
- [ ] MongoDB connection working
- [ ] Environment variables set
- [ ] API responds to requests
- [ ] Health check: `https://your-backend.onrender.com/api`

✅ **Frontend (Netlify)**
- [ ] Tailwind CSS is applied
- [ ] API URL points to Render backend
- [ ] CORS headers allow requests
- [ ] Admin login works
- [ ] Employee data loads

### Troubleshooting

**Tailwind CSS not applying on Netlify:**
- Ensure `npm run build` generates `build/main.css`
- Check `netlify.toml` has correct build command
- Verify HTML links to `build/main.css`

**Backend API not responding:**
- Check Render logs in "Events" tab
- Verify environment variables are set correctly
- Check MongoDB connection string
- Ensure backend service is running (not sleeping)

**Blank page on Netlify:**
- Check browser console for errors (F12)
- Verify redirects configuration
- Check if `index.html` exists in Frontend folder

**CORS errors:**
- Update backend CORS to include Netlify domain
- Restart backend service after changes

---

## ENVIRONMENT VARIABLES REFERENCE

### Backend (.env)
```
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_super_secret_key_min_32_chars
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
NODE_ENV=production
```

### Frontend (Netlify Environment)
```
API_BASE_URL=https://soul-pharma-backend.onrender.com/api
```

---

## URLS AFTER DEPLOYMENT

- **Backend API**: `https://your-backend-name.onrender.com/api`
- **Frontend Site**: `https://your-site-name.netlify.app`
- **Admin Panel**: `https://your-site-name.netlify.app/admin-1903.html`
- **Employee Dashboard**: `https://your-site-name.netlify.app/employee-dashboard.html`

---

## IMPORTANT NOTES

1. **Free Tier Limitations**:
   - Render free tier has 512MB RAM and 0.5 CPU
   - Goes to sleep after 15 minutes of inactivity
   - Netlify free tier is sufficient for frontend

2. **Database**:
   - Use MongoDB Atlas free tier (8GB storage)
   - Create API keys from Cloudinary free tier

3. **Email Service**:
   - Use Gmail App Password (not regular password)
   - Enable 2FA on Gmail first

4. **SSL/HTTPS**:
   - Both Render and Netlify provide free HTTPS

5. **Monitoring**:
   - Monitor Render logs regularly
   - Check Netlify deploy logs for build errors

---

## NEXT STEPS

After deployment, consider:
- [ ] Set up custom domain for frontend
- [ ] Configure email notifications
- [ ] Set up automated backups for MongoDB
- [ ] Monitor error logs regularly
- [ ] Upgrade to paid plans if needed
