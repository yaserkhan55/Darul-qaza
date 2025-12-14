# Deployment Guide for Darul Qaza Frontend

This guide will help you deploy the Darul Qaza frontend application to production.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A hosting service (Vercel, Netlify, AWS, etc.)
- Backend API URL

## Environment Variables

Before deploying, you need to set up environment variables:

### Development (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Production (.env.production)
```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

**Important:** 
- Never commit `.env` files to git (already in .gitignore)
- Use your hosting platform's environment variable settings for production
- Replace `https://your-backend-api.com/api` with your actual backend URL

## Build for Production

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set production environment variable:**
   - Create `.env.production` file OR
   - Set environment variable in your hosting platform

3. **Build the application:**
   ```bash
   npm run build
   ```
   
   This creates an optimized production build in the `dist` folder.

4. **Preview the build locally (optional):**
   ```bash
   npm run preview
   ```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   - Go to your project settings on Vercel
   - Add `VITE_API_BASE_URL` with your production API URL

4. **Automatic Deployments:**
   - Connect your GitHub repository
   - Vercel will auto-deploy on every push

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set Environment Variables:**
   - Go to Site settings > Environment variables
   - Add `VITE_API_BASE_URL`

4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Option 3: AWS S3 + CloudFront

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront:**
   - Point to your S3 bucket
   - Set up custom domain (optional)

### Option 4: Traditional Web Server (Apache/Nginx)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload `dist` folder contents to your web server**

3. **Configure server:**
   - For Apache: Enable mod_rewrite and add `.htaccess` rules
   - For Nginx: Configure try_files directive

4. **Example Nginx config:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/darul-qaza/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test API connectivity from production URL
- [ ] Check CORS settings on backend (allow your frontend domain)
- [ ] Test authentication flow
- [ ] Verify all routes work correctly
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify HTTPS is enabled (required for secure cookies)

## Troubleshooting

### CORS Errors
- Ensure your backend allows requests from your frontend domain
- Check that `withCredentials: true` is set in axios config

### 404 Errors on Refresh
- Configure your server to serve `index.html` for all routes (SPA routing)
- See server configuration examples above

### API Connection Issues
- Verify `VITE_API_BASE_URL` is set correctly
- Check that backend is accessible from production
- Ensure backend CORS allows your frontend domain

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## Performance Optimization

The build is already optimized with:
- Code splitting (vendor chunks)
- Minification
- Tree shaking
- Asset optimization

## Security Notes

- Never expose API keys or secrets in frontend code
- Use environment variables for all configuration
- Ensure HTTPS is enabled in production
- Regularly update dependencies: `npm audit fix`

## Support

For issues or questions, check:
- Vite documentation: https://vite.dev
- React documentation: https://react.dev
- Your hosting platform's documentation

