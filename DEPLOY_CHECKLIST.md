# ✅ Deployment Checklist - Quick Reference

**Use this checklist when deploying to Vercel**

---

## 🚀 **Pre-Deployment**

- [ ] All code pushed to GitHub
- [ ] `.env.example` file exists
- [ ] No API keys in git history
- [ ] Build passes locally: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] TypeScript checks: `npx tsc --noEmit`

---

## 🔑 **Vercel Environment Variables**

Set these in **Vercel Dashboard → Settings → Environment Variables:**

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://vnmitmeqqzuzquevxsaz.supabase.co/functions/v1` | ✅ Production, Preview, Development |
| `NEXT_PUBLIC_API_KEY` | Your Supabase API key | ✅ Production, Preview, Development |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps key | ✅ Production, Preview, Development |

---

## 🔐 **GitHub Secrets**

Set these in **GitHub → Settings → Secrets and variables → Actions:**

- [ ] `VERCEL_TOKEN` - From [vercel.com/account/tokens](https://vercel.com/account/tokens)
- [ ] `VERCEL_ORG_ID` - From `.vercel/project.json` after running `vercel link`
- [ ] `VERCEL_PROJECT_ID` - From `.vercel/project.json`
- [ ] `NEXT_PUBLIC_API_BASE_URL` - Same as Vercel
- [ ] `NEXT_PUBLIC_API_KEY` - Same as Vercel
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Same as Vercel

---

## 📋 **Deployment Steps**

1. **Import to Vercel:**
   ```
   vercel.com/new → Import GitHub repo
   ```

2. **Set environment variables** (see above)

3. **Redeploy:**
   ```bash
   git push origin main
   ```
   OR click "Redeploy" in Vercel Dashboard

4. **Verify deployment:**
   - Visit your Vercel URL
   - Check all features work
   - Open DevTools → Network tab
   - Verify API calls succeed

---

## ✅ **Post-Deployment Testing**

Test these features:

- [ ] Static sensors map loads
- [ ] Mobile sensors map loads
- [ ] Sensor tables show data
- [ ] Click parameter → Modal opens with history
- [ ] Analytics charts display
- [ ] Bar charts work
- [ ] Multi-location comparison works
- [ ] No console errors
- [ ] API calls return 200 status

---

## 🔍 **Quick Debug Commands**

```bash
# Test build locally
npm run build

# Check types
npx tsc --noEmit

# Check linting
npm run lint

# View Vercel logs
vercel logs

# Deploy to production
vercel --prod
```

---

## 📞 **Need Help?**

- **Deployment failing?** → Check `VERCEL_DEPLOYMENT_GUIDE.md`
- **API not working?** → Verify environment variables
- **Build errors?** → Check GitHub Actions logs
- **CORS errors?** → Verify API proxy configuration in `lib/api/config.ts`

---

## 🎯 **Success Criteria**

✅ Build succeeds  
✅ No TypeScript errors  
✅ No ESLint warnings  
✅ All env vars configured  
✅ App loads on Vercel URL  
✅ All 7 features working  
✅ API calls return real data  
✅ No console errors  

---

**Ready to deploy? Follow the full guide: `VERCEL_DEPLOYMENT_GUIDE.md`** 🚀
