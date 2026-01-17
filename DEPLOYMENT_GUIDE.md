# Deployment Guide - Dar-ul-Qaza

This guide covers deploying the frontend to Vercel and backend to Render.

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (free tier available)

### Steps

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `Frontend` folder as root directory

3. **Configure Environment Variables:**
   In Vercel project settings, add:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```
   Replace with your actual Render backend URL

4. **Build Settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - Your site will be live at `your-project.vercel.app`

### Vercel Configuration
The `vercel.json` file is already configured for:
- SPA routing (all routes redirect to index.html)
- Security headers
- Proper caching

## Backend Deployment (Render)

### Prerequisites
- GitHub account
- Render account (free tier available)

### Steps

1. **Prepare Backend:**
   - Ensure all dependencies are in `package.json`
   - Create a `.env.example` file with required variables

2. **Deploy to Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `Backend` folder

3. **Configure Service:**
   - **Name:** darul-qaza-backend (or your choice)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid for better performance)

4. **Environment Variables:**
   Add these in Render dashboard:
   ```
   PORT=10000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_string
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy
   - Your API will be at `your-service.onrender.com`

### MongoDB Atlas Setup

1. **Create Account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Add database name: `darul-qaza`

3. **Network Access:**
   - Add IP `0.0.0.0/0` to allow all IPs (for Render)
   - Or add specific Render IPs

4. **Update Backend:**
   - Use connection string in Render environment variables

## Post-Deployment Checklist

### Frontend (Vercel)
- [ ] Environment variable `VITE_API_BASE_URL` set correctly
- [ ] Site loads without errors
- [ ] All routes work (test navigation)
- [ ] API calls work (check browser console)
- [ ] Mobile responsive (test on phone)

### Backend (Render)
- [ ] All environment variables set
- [ ] MongoDB connection working
- [ ] API endpoints accessible
- [ ] CORS allows frontend domain
- [ ] Health check endpoint works

### Integration
- [ ] Frontend can connect to backend
- [ ] Authentication works (if implemented)
- [ ] Forms submit successfully
- [ ] PDF generation works
- [ ] Admin panel accessible

## Environment Variables Reference

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

### Backend (.env)
```env
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/darul-qaza?retryWrites=true&w=majority
JWT_SECRET=your_secure_secret_key_here
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

## Custom Domain Setup

### Vercel (Frontend)
1. Go to project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate auto-generated

### Render (Backend)
1. Go to service settings → Custom Domain
2. Add your domain
3. Update DNS records
4. SSL certificate auto-generated

## Troubleshooting

### Frontend Issues
- **404 on refresh:** Already handled by `vercel.json`
- **API errors:** Check `VITE_API_BASE_URL` is correct
- **CORS errors:** Update backend `FRONTEND_URL`

### Backend Issues
- **MongoDB connection:** Check connection string and network access
- **Port issues:** Render uses port from `PORT` env var
- **Build fails:** Check `package.json` dependencies

### Common Fixes
1. **Clear cache:** Hard refresh browser (Ctrl+Shift+R)
2. **Check logs:** Vercel and Render provide detailed logs
3. **Environment vars:** Double-check all variables are set
4. **CORS:** Ensure backend allows frontend domain

## Monitoring

### Vercel Analytics
- Enable in project settings
- Track performance and errors

### Render Logs
- View real-time logs in dashboard
- Set up alerts for errors

## Cost Estimation

### Free Tier
- **Vercel:** Unlimited deployments, 100GB bandwidth
- **Render:** 750 hours/month, sleeps after 15min inactivity
- **MongoDB Atlas:** 512MB storage, shared cluster

### Paid Options (if needed)
- **Vercel Pro:** $20/month (better performance)
- **Render:** $7/month (always-on, no sleep)
- **MongoDB Atlas:** $9/month (2GB storage)

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] Strong JWT secret
- [ ] MongoDB password is secure
- [ ] CORS properly configured
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Security headers configured (in vercel.json)

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

