# 🚀 Investment Tracker - FREE Deployment Guide

## 💰 **Cheapest Option: Vercel (FREE FOREVER)** ⭐⭐⭐⭐⭐

### Why Vercel?
- ✅ Built by Next.js team (best performance)
- ✅ Free tier includes 100GB bandwidth/month
- ✅ Automatic HTTPS/SSL certificates
- ✅ Continuous deployment from Git
- ✅ Supports MongoDB Atlas free tier
- ✅ No credit card required

---

## 📋 **Step-by-Step Deployment**

### Step 1: Prepare Your Code (5 min)

```bash
# Create .env file with production values
cp .env.production.example .env

# Edit .env and add your real credentials:
# - MongoDB Atlas connection string (FREE tier)
# - NextAuth secret key
# - Vercel deployment URL
```

### Step 2: Test Your Build Locally

```bash
npm run build
npm start
```

If build succeeds, you're ready! ✅

### Step 3: Push to GitHub/GitLab (5 min)

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 4: Deploy to Vercel (10 min)

1. Go to [vercel.com](https://vercel.com) and sign up (free account)
2. Click **"New Project"** → Import your GitHub repo
3. Configure:
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Add Environment Variables in Vercel Dashboard:
   ```
   NODE_ENV=production
   NEXTAUTH_URL=https://your-app.vercel.app
   MONGODB_URI=mongodb+srv://...
   NEXT_PUBLIC_YAHOO_FINANCE_SEARCH_URL=...
   ```
5. Click **"Deploy"**!

### Step 5: Add MongoDB Atlas (FREE - 10 min)

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free cluster (M0 tier, 512MB storage)
3. Get connection string from cluster settings
4. Add to Vercel environment variables as `MONGODB_URI`

---

## 🎯 **Alternative FREE Options**

### Option B: Cloudflare Pages ($0/month)
- Same features as Vercel
- Better global CDN
- Setup: [pages.cloudflare.com](https://pages.cloudflare.com)

### Option C: Netlify ($0/month)  
- Good for simple deployments
- Setup: [netlify.com](https://netlify.com)

---

## 💾 **Database Options (FREE)**

| Database | Free Tier | Storage | Cost |
|----------|-----------|---------|------|
| MongoDB Atlas | ✅ M0 Cluster | 512 MB | $0 |
| Supabase | ✅ PostgreSQL | 500 MB | $0 |
| PlanetScale | ✅ MySQL/PostgreSQL | 100MB | $0 (generous) |

**Recommendation**: Use **MongoDB Atlas** since your app uses MongoDB.

---

## 📊 **Cost Breakdown**

### FREE Stack:
```
Vercel (Hosting + Functions):     $0/month
MongoDB Atlas (Database):         $0/month  
SSL Certificates:                 Free
CDN/Global Edge Network:          Included
Analytics:                        Free tier included
Total Cost:                       $0/month! 🎉
```

### When You Need to Upgrade:
- **Vercel Pro ($20/mo)**: More bandwidth, custom domains, analytics
- **MongoDB Atlas M10 ($97/mo)**: 30GB storage, dedicated resources
- **Custom Domain**: Free on all platforms (just pay for domain registration)

---

## 🔧 **Environment Variables Setup**

### For Vercel Dashboard → Settings → Environment Variables:

```bash
# Required
NODE_ENV=production
NEXTAUTH_URL=https://your-app.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/investment-tracker?retryWrites=true&w=majority

# Optional but recommended
NEXTAUTH_SECRET=generate-a-random-secret-key-here (use: openssl rand -base64 32)
WEBAUTHN_RP_ID=yourapp.vercel.app
WEBAUTHN_RP_NAME="Investment Tracker"

# Yahoo Finance API
NEXT_PUBLIC_YAHOO_FINANCE_SEARCH_URL=https://query1.finance.yahoo.com/v1/finance/search
NEXT_PUBLIC_YAHOO_FINANCE_QUOTE_URL=https://query2.finance.yahoo.com/v8/finance/chart
```

---

## 🚀 **Quick Deploy Commands**

### Using Vercel CLI (Optional):
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Automatic Deployment:
Every time you push to GitHub, Vercel automatically builds and deploys!

---

## ✅ **Deployment Checklist**

- [ ] Create MongoDB Atlas free cluster
- [ ] Generate NextAuth secret key
- [ ] Update `.env` with production values
- [ ] Test `npm run build` locally
- [ ] Push code to GitHub/GitLab
- [ ] Connect repo to Vercel dashboard
- [ ] Add environment variables in Vercel
- [ ] Deploy! 🎉

---

## 🔗 **Useful Links**

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas/pricing)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Pricing](https://vercel.com/pricing)

---

## 💡 **Pro Tips**

1. **Use MongoDB Atlas M0 tier**: 512MB is enough for starting out
2. **Enable analytics in Vercel**: Free tier includes basic analytics
3. **Custom domain**: Add your own domain (e.g., `investor.yourname.com`) - FREE!
4. **CI/CD**: Automatic deployments on every commit to main branch
5. **Preview deployments**: Create feature branches for testing before merging

---

## 🎉 **Total Cost: $0/month!**

Your investment tracker can be live and serving users completely free with Vercel + MongoDB Atlas!

**Ready to deploy?** Start at [vercel.com/new](https://vercel.com/new) → Import your GitHub repo! 🚀