# Vercel Deployment Setup Guide

## Required Environment Variables

To deploy this application on Vercel, you need to set the following environment variables:

### 1. Clerk Authentication Key

**Variable Name:** `VITE_CLERK_PUBLISHABLE_KEY`

**How to get it:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application (or create a new one)
3. Go to **API Keys** section
4. Copy the **Publishable Key** (starts with `pk_test_` for development or `pk_live_` for production)

**How to set in Vercel:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Name:** `VITE_CLERK_PUBLISHABLE_KEY`
   - **Value:** Your Clerk publishable key
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application for changes to take effect

### 2. Backend API URL

**Variable Name:** `VITE_API_URL`

**Value:** `https://darul-qaza-backend.onrender.com/api`

**How to set in Vercel:**
1. Go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Enter:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://darul-qaza-backend.onrender.com/api`
   - **Environment:** Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application

## Clerk Configuration

After setting up your Clerk publishable key, configure your Clerk application:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Paths** section
4. Set the following:
   - **Sign-in URL:** `/sign-in`
   - **Sign-up URL:** `/sign-up`
   - **After sign-in URL:** `/dashboard`
   - **After sign-up URL:** `/dashboard`

## Quick Setup Checklist

- [ ] Get Clerk publishable key from Clerk Dashboard
- [ ] Add `VITE_CLERK_PUBLISHABLE_KEY` to Vercel environment variables
- [ ] Add `VITE_API_URL` to Vercel environment variables
- [ ] Configure Clerk paths (sign-in, sign-up, redirects)
- [ ] Redeploy application on Vercel
- [ ] Test authentication flow

## Troubleshooting

### "Configuration Required" message appears
- Check that `VITE_CLERK_PUBLISHABLE_KEY` is set in Vercel
- Ensure the variable is available for the environment you're deploying to
- Redeploy after adding environment variables

### Authentication not working
- Verify Clerk publishable key is correct
- Check Clerk dashboard for any errors
- Ensure Clerk paths are configured correctly
- Check browser console for errors

### API calls failing
- Verify `VITE_API_URL` is set correctly
- Check backend is running and accessible
- Verify CORS settings on backend allow your Vercel domain

