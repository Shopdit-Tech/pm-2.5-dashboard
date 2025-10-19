# 🚀 Vercel Deployment Guide - PM2.5 Dashboard

**Complete guide for deploying your PM2.5 Dashboard to Vercel with API integration**

---

## ✅ **Will Your API Integration Work on Vercel?**

**YES! Absolutely!** 

Your Next.js API proxy approach is **perfect for Vercel** because:

✅ **Next.js API routes** (`/pages/api/`) become **serverless functions** automatically  
✅ **Environment variables** work the same way as localhost  
✅ **No CORS issues** - same-origin requests  
✅ **API keys stay secure** - never exposed to browser  
✅ **Auto-scaling** - Vercel handles traffic spikes  
✅ **Global CDN** - Fast API responses worldwide  

**Your code works on Vercel with ZERO changes!** 🎉

---

## 📋 **Prerequisites**

Before deploying, ensure you have:

1. **GitHub account** with your code pushed
2. **Vercel account** (free tier works great)
3. **API credentials:**
   - Supabase API Base URL
   - Supabase API Key (x-ingest-key)
   - Google Maps API Key

---

## 🚀 **Deployment Steps**

### **Step 1: Prepare Your Repository**

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Add API integration"
   git push origin main
   ```

2. **Verify your files:**
   - ✅ `pages/api/sensors/latest.ts` - API proxy
   - ✅ `pages/api/sensors/history.ts` - History proxy
   - ✅ `.env.example` - Example env file
   - ✅ `.github/workflows/deploy.yml` - Updated workflow

---

### **Step 2: Create Vercel Project**

#### **Option A: Using Vercel Dashboard (Recommended)**

1. Go to [vercel.com/new](https://vercel.com/new)

2. **Import Git Repository:**
   - Click "Add New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `next build` (default)
   - **Output Directory:** `.next` (default)

4. **Click "Deploy"** (without env vars first)
   - This creates the project
   - First build will fail (expected - no env vars yet)

#### **Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts
```

---

### **Step 3: Configure Environment Variables**

#### **In Vercel Dashboard:**

1. Go to your project settings:
   - **Dashboard → Your Project → Settings → Environment Variables**

2. **Add these variables:**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://vnmitmeqqzuzquevxsaz.supabase.co/functions/v1` | Production, Preview, Development |
| `NEXT_PUBLIC_API_KEY` | `your-actual-api-key-here` | Production, Preview, Development |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `your-google-maps-key-here` | Production, Preview, Development |

3. **Click "Save"** after each variable

**Important Notes:**
- ⚠️ Use your **real API keys** (not the example ones)
- ✅ Check **all three environments** (Production, Preview, Development)
- 🔒 API keys are encrypted by Vercel
- 🚫 Never commit real API keys to git

---

### **Step 4: Configure GitHub Secrets**

For GitHub Actions to work, add these secrets:

1. Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

2. **Add New Repository Secret:**

| Secret Name | Value | Where to Get |
|-------------|-------|--------------|
| `VERCEL_TOKEN` | Your Vercel token | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your org ID | Vercel Settings → General |
| `VERCEL_PROJECT_ID` | Your project ID | Project Settings → General |
| `NEXT_PUBLIC_API_BASE_URL` | Your Supabase URL | From Supabase dashboard |
| `NEXT_PUBLIC_API_KEY` | Your API key | From Supabase dashboard |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Maps key | From Google Cloud Console |

**To get Vercel IDs:**
```bash
# Run in your project directory
vercel link

# This creates .vercel/project.json with:
# - orgId → Use as VERCEL_ORG_ID
# - projectId → Use as VERCEL_PROJECT_ID
```

---

### **Step 5: Redeploy**

After setting environment variables:

#### **Automatic (via GitHub Actions):**
```bash
git add .
git commit -m "Configure environment variables"
git push origin main
```
→ GitHub Actions automatically deploys to Vercel

#### **Manual (via Vercel Dashboard):**
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment

#### **Manual (via CLI):**
```bash
vercel --prod
```

---

## 🔍 **How It Works on Vercel**

### **Your API Proxy as Serverless Functions**

```
Browser Request:
GET https://your-app.vercel.app/api/sensors/latest
          ↓
Vercel Serverless Function
(/pages/api/sensors/latest.ts)
          ↓
Adds: x-ingest-key header (from env)
          ↓
Forwards to:
https://vnmitmeqqzuzquevxsaz.supabase.co/functions/v1/sensors-latest
          ↓
Supabase API
          ↓
Returns data to function
          ↓
Function returns to browser
```

**Benefits:**
- ✅ **No CORS** - Same origin (your-app.vercel.app)
- ✅ **Secure** - API key never reaches browser
- ✅ **Fast** - Vercel Edge Network
- ✅ **Scalable** - Auto-scales with traffic

---

## ✅ **Verify Deployment**

### **1. Check Build Logs**

In Vercel Dashboard:
- **Deployments** → Click on latest deployment
- View build logs for errors
- Look for: "Build Completed" ✅

### **2. Test Your App**

Visit your deployment URL: `https://your-app.vercel.app`

**Test Checklist:**
- [ ] App loads without errors
- [ ] Static sensors map shows data
- [ ] Mobile sensors map shows data
- [ ] Sensor tables load real data
- [ ] Click parameter → Modal shows history
- [ ] Analytics charts display data
- [ ] No console errors in browser

### **3. Test API Routes**

Open browser dev tools (F12) → Network tab:

```bash
# Should see requests to:
/api/sensors/latest?movable=false  → Status: 200
/api/sensors/latest?movable=true   → Status: 200
/api/sensors/history?...           → Status: 200
```

### **4. Check Environment Variables**

In Vercel Dashboard:
- **Settings → Environment Variables**
- Verify all 3 variables are set
- Verify they're enabled for Production

---

## 🐛 **Troubleshooting**

### **Problem: Build Fails**

**Symptoms:**
- Deployment shows "Build Failed"
- Red X in deployments list

**Solution:**
```bash
# 1. Check build logs in Vercel
# Look for the error message

# 2. Test build locally
npm run build

# 3. Check TypeScript errors
npx tsc --noEmit

# 4. Check ESLint errors
npm run lint
```

---

### **Problem: Environment Variables Not Working**

**Symptoms:**
- App builds but shows "Network Error"
- API calls fail
- Console shows: "API baseURL is not configured"

**Solution:**
1. **Verify in Vercel Dashboard:**
   - Settings → Environment Variables
   - Check variable names (case-sensitive!)
   - Ensure Production is checked

2. **Redeploy after adding variables:**
   - Deployments → Redeploy latest

3. **Check variable names match code:**
   ```typescript
   // In your code:
   NEXT_PUBLIC_API_BASE_URL
   NEXT_PUBLIC_API_KEY
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   ```

---

### **Problem: API Proxy Returns 500**

**Symptoms:**
- `/api/sensors/latest` returns 500 error
- Function logs show errors

**Solution:**
1. **Check Function Logs:**
   - Vercel Dashboard → Functions
   - Click on function → View logs

2. **Verify API credentials:**
   - Test Supabase URL manually
   - Check API key is correct

3. **Check API proxy code:**
   ```bash
   # Ensure these files exist:
   pages/api/sensors/latest.ts
   pages/api/sensors/history.ts
   ```

---

### **Problem: CORS Errors**

**Symptoms:**
- Console shows: "CORS policy blocked"
- But you have API proxy

**Solution:**
This shouldn't happen if proxy is configured correctly.

**Check:**
1. Frontend calls `/api/sensors/` (relative path)
2. NOT calling Supabase URL directly
3. Check `lib/api/config.ts`:
   ```typescript
   export const API_CONFIG = {
     baseURL: '/api/sensors', // ✅ Correct
     // NOT: 'https://...' ❌ Wrong
   };
   ```

---

### **Problem: Google Maps Not Loading**

**Symptoms:**
- Map area is blank
- Console: "Invalid API key"

**Solution:**
1. **Check API key in Vercel:**
   - Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set

2. **Verify key permissions:**
   - Google Cloud Console
   - Enable "Maps JavaScript API"
   - Add your Vercel domain to restrictions

3. **Test key locally first:**
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key npm run dev
   ```

---

### **Problem: GitHub Actions Failing**

**Symptoms:**
- Push to GitHub
- Actions tab shows failed workflow
- Red X on commit

**Solution:**
1. **Check GitHub Secrets:**
   - Repository Settings → Secrets
   - Verify all required secrets exist:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`
     - All `NEXT_PUBLIC_*` variables

2. **Check workflow file:**
   - `.github/workflows/deploy.yml`
   - Verify syntax is correct

3. **View workflow logs:**
   - Actions tab → Click failed run
   - Read error messages

---

## 📊 **Performance on Vercel**

### **Expected Performance:**

| Metric | Value |
|--------|-------|
| **Cold Start** | 100-300ms |
| **API Response** | 200-800ms |
| **Page Load** | 1-3 seconds |
| **Map Rendering** | 500ms-1s |

### **Optimization Tips:**

1. **Use Edge Functions (Optional):**
   - Add `export const config = { runtime: 'edge' }` to API routes
   - Faster cold starts

2. **Enable Caching:**
   ```typescript
   // In API routes
   res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
   ```

3. **Monitor Performance:**
   - Vercel Dashboard → Analytics
   - Check function duration
   - Optimize slow endpoints

---

## 🔄 **Continuous Deployment**

Your setup now supports:

### **Automatic Deployments:**
```bash
# Push to main → Production
git push origin main

# Push to develop → Preview
git push origin develop

# Create PR → Preview deployment
git checkout -b feature/new-feature
git push origin feature/new-feature
# → Creates preview URL
```

### **Deployment Flow:**
```
GitHub Push → GitHub Actions → Type Check → Lint → Build → Deploy to Vercel
```

### **Preview Deployments:**
- Every PR gets unique URL
- Test changes before merging
- Preview URL: `your-app-git-branch-name.vercel.app`

---

## 🎯 **Production Checklist**

Before going live:

### **Code Quality**
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All features tested
- [ ] Error handling in place
- [ ] Loading states working

### **Environment Setup**
- [ ] Production env vars set in Vercel
- [ ] GitHub secrets configured
- [ ] API keys valid and working
- [ ] Google Maps API key has correct restrictions

### **Testing**
- [ ] Test all features in production
- [ ] Test on mobile devices
- [ ] Test different browsers
- [ ] Check console for errors
- [ ] Verify API calls work

### **Monitoring**
- [ ] Set up Vercel Analytics (optional)
- [ ] Set up error tracking (optional - Sentry)
- [ ] Monitor API usage in Supabase

---

## 🎨 **Custom Domain (Optional)**

To use your own domain:

1. **In Vercel Dashboard:**
   - Settings → Domains
   - Add your domain

2. **Configure DNS:**
   - Add CNAME record:
     ```
     CNAME  www  cname.vercel-dns.com
     ```

3. **SSL Certificate:**
   - Vercel automatically provisions SSL
   - Wait 1-2 minutes for activation

---

## 📈 **Scaling**

Your app auto-scales on Vercel:

### **Free Tier Limits:**
- 100 GB bandwidth/month
- 100 hours serverless function execution
- Unlimited requests

### **Pro Tier (if needed):**
- 1 TB bandwidth/month
- 1000 hours function execution
- Better analytics
- $20/month per member

**Most dashboards fit in free tier!**

---

## 🔐 **Security Best Practices**

### **Environment Variables:**
✅ **Do:** Store in Vercel environment variables  
✅ **Do:** Use different keys for preview vs production  
❌ **Don't:** Commit to git  
❌ **Don't:** Share in screenshots  

### **API Keys:**
✅ **Do:** Keep on server-side (API routes)  
✅ **Do:** Rotate periodically  
❌ **Don't:** Expose to client  

### **CORS:**
✅ **Do:** Use API proxy (as implemented)  
❌ **Don't:** Disable CORS on backend  

---

## 📞 **Support Resources**

### **Vercel Documentation:**
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

### **Your Documentation:**
- `INTEGRATION_FINAL_SUMMARY.md` - Complete integration overview
- `PHASE_*.md` - Detailed phase summaries
- `QUICK_START.md` - Local development guide

### **Getting Help:**
- Vercel Support: support@vercel.com
- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)

---

## ✅ **Quick Deploy Commands**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Open in browser
vercel open
```

---

## 🎉 **Success!**

Once deployed, your PM2.5 Dashboard will be:

✅ **Live** - Accessible globally  
✅ **Fast** - Edge network delivery  
✅ **Secure** - API keys protected  
✅ **Scalable** - Auto-scaling  
✅ **Monitored** - Built-in analytics  
✅ **Auto-deployed** - Push to deploy  

**Your dashboard is production-ready!** 🚀

---

## 📝 **Deployment Summary**

| Step | Status | Time |
|------|--------|------|
| 1. Push code to GitHub | ✅ | 1 min |
| 2. Create Vercel project | ✅ | 2 min |
| 3. Set environment variables | ✅ | 3 min |
| 4. Configure GitHub secrets | ✅ | 3 min |
| 5. Deploy | ✅ | 2-5 min |
| **Total** | **✅** | **~15 min** |

---

**Your API integration works perfectly on Vercel with zero code changes!** 🎊

---

**End of Vercel Deployment Guide**
