# 🚀 Quick Start Guide - API Integration

## ⚡ **Get Started in 3 Steps**

### **Step 1: Configure Environment**

Create or update `.env.local`:

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and add your keys
nano .env.local
```

Required variables:
```env
NEXT_PUBLIC_API_BASE_URL=https://vnmitmeqqzuzquevxsaz.supabase.co/functions/v1
NEXT_PUBLIC_API_KEY=super-long-random-token
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### **Step 2: Install & Run**

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

### **Step 3: Test**

Open browser to `http://localhost:3000`

1. Click "Static Sensors" in sidebar
2. Check browser console (F12)
3. Look for `✅ Successfully fetched X static sensors`
4. Verify markers appear on map

---

## 🎯 **What's Working Now**

✅ **Static Sensors Map**
- Real-time data from Supabase API
- Auto-refresh every 60 seconds
- Shows sensor status (online/offline)
- Displays PM2.5, temperature, humidity, CO2
- Click markers for detailed info

---

## 🔜 **What's Next**

❌ **Mobile Routes** - Not yet integrated (still using mock data)  
❌ **Historical Charts** - Not yet integrated (still using mock data)  
❌ **Data Tables** - Not yet integrated (still using mock data)

---

## 🐛 **Quick Troubleshooting**

### **Problem: No sensors showing**

**Solution:**
```bash
# 1. Check if .env.local exists
cat .env.local

# 2. Restart dev server
# Press Ctrl+C, then:
npm run dev

# 3. Check console for errors
# Open browser console (F12)
```

### **Problem: 401 Unauthorized**

**Solution:** Check API key in `.env.local` is correct

### **Problem: CORS error**

**Solution:** Supabase functions should allow all origins, check API configuration

---

## 📚 **Documentation**

- **Full Integration Details:** See `API_INTEGRATION_SUMMARY.md`
- **API Spec:** See `api.md`
- **Business Requirements:** See `business-req.md`

---

## 💡 **Tips**

1. **Check Console Logs:** Always open browser console to see API calls
2. **Refresh Button:** Use the refresh button to manually reload data
3. **Auto-refresh:** Map auto-refreshes every 60 seconds
4. **Error Messages:** App shows alerts if API fails
5. **Fallback:** Returns empty array on error (no app crash)

---

## 🎉 **Success Indicators**

You'll know it's working when you see:

**In Browser Console:**
```
🔄 Fetching static sensors from real API...
🌐 API Request: GET /sensors-latest?movable=false
✅ API Response: 200 /sensors-latest
📊 Fetched 20 sensors (movable: false)
✅ Successfully fetched 20 static sensors
📍 Sensors to render: 20
```

**On the Map:**
- Markers at real locations in Bangkok
- Colored by PM2.5 levels
- Statistics showing real sensor counts
- Click markers to see live data

---

**That's it! You're ready to go!** 🚀
