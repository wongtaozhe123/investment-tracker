# 🚀 Investment Tracker - Quick Start Guide

## ✅ **Prerequisites Checklist**

- [ ] Node.js installed (v18+)
- [ ] Git installed
- [ ] MongoDB Atlas account created (see MONGODB_SETUP.md)
- [ ] GitHub/GitLab repository for your code

---

## 📋 **Step 1: Set Up MongoDB Atlas (10 min)**

### Quick Links:
- [MongoDB Atlas Sign Up](https://www.mongodb.com/cloud/atlas/register)
- [Create Free Cluster](https://www.mongodb.com/docs/atlas/tutorial/create-free-cluster/)

### Steps:
1. **Sign up** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. **Create M0 cluster** (FREE, 512MB storage)
3. **Create database user**: `investor_admin` with strong password
4. **Configure network access**: Allow from anywhere (0.0.0.0/0) for development
5. **Get connection string** from Database → Connect icon

### Save Your Connection String:

```bash
# Copy this to your .env.local file
MONGODB_URI=mongodb+srv://investor_admin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/investment-tracker?retryWrites=true&w=majority&appName=InvestmentTracker
```

**⚠️ IMPORTANT**: Replace `YOUR_PASSWORD_HERE` with your actual password from Step 3!

---

## 📋 **Step 2: Configure Environment Variables (2 min)**

Create/update `.env.local`:

```bash
# Copy the example file first
cp .env.production.example .env.local

# Edit .env.local and add:
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://investor_admin:YourPassword@cluster.mongodb.net/investment-tracker?retryWrites=true&w=majority&appName=InvestmentTracker
WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_NAME="Investment Tracker"

# Generate a secure secret key for NextAuth
NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

---

## 📋 **Step 3: Test MongoDB Connection (1 min)**

Run the test script:

```bash
# Make sure .env.local is set up correctly
node test-mongodb.js
```

**Expected output:**
```
🔍 Testing MongoDB Atlas Connection...
📡 Connecting to MongoDB Atlas...
✅ Connected successfully!
📂 Database: investment-tracker
📊 Collections in database:
  1. holdings: X documents
  2. settings: 1 document

✅ MongoDB Atlas setup is working correctly!
```

---

## 📋 **Step 4: Build and Test Locally (3 min)**

```bash
# Install dependencies (if not already done)
npm install

# Build the app
npm run build

# Start development server
npm run dev
```

Visit: http://localhost:3000

---

## 📋 **Step 5: Deploy to Vercel (FREE - 5 min)**

### Option A: Automatic Deployment (Recommended)

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Add MongoDB Atlas and PWA support"
   git push origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your GitHub repository
4. Add environment variables:
   ```
   NODE_ENV=production
   NEXTAUTH_URL=https://your-app.vercel.app
   MONGODB_URI=mongodb+srv://... (same as .env.local)
   WEBAUTHN_RP_ID=yourapp.vercel.app
   WEBAUTHN_RP_NAME="Investment Tracker"
   NEXTAUTH_SECRET=<generate-new-secret>
   ```

5. Click **"Deploy"**!

### Option B: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🎯 **Deployment Checklist**

- [ ] MongoDB Atlas cluster created and running
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0 for dev, specific IPs for prod)
- [ ] Connection string saved in `.env.local`
- [ ] Environment variables set up correctly
- [ ] Build succeeds locally (`npm run build`)
- [ ] MongoDB connection test passes (`node test-mongodb.js`)
- [ ] Code pushed to GitHub/GitLab
- [ ] Deployed to Vercel/Cloudflare Pages

---

## 📊 **Cost Summary**

| Service | Plan | Cost/Month |
|---------|------|------------|
| Vercel (Hosting) | Free Tier | $0 |
| MongoDB Atlas | M0 Cluster | $0 |
| SSL Certificates | Automatic | Free |
| CDN/Edge Network | Included | Free |
| **TOTAL** | | **$0!** 🎉 |

---

## 🔗 **Useful Links**

- [MongoDB Atlas Setup Guide](./MONGODB_SETUP.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas/pricing)

---

## 💡 **Pro Tips**

1. **Use MongoDB Compass**: Download free tool to visualize your data
2. **Enable Analytics**: Vercel includes basic analytics in free tier
3. **Custom Domain**: Add your own domain (e.g., `investor.yourname.com`) - FREE!
4. **CI/CD**: Automatic deployments on every commit to main branch
5. **Environment Variables**: Never commit `.env` files to Git

---

## 🆘 **Troubleshooting**

### MongoDB Connection Failed?
```bash
# Check connection string format
echo $MONGODB_URI

# Verify Atlas cluster is deployed
# Go to: https://cloud.mongodb.com/ → Clusters → Status

# Check network access settings
# Atlas Dashboard → Network Access → IP Whitelist
```

### Build Fails?
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### PWA Not Working in Dev Mode?
- This is normal! PWA caching is disabled in development
- Full PWA features work only in production builds

---

## 🎉 **You're Ready!**

Your Investment Tracker app is now ready to deploy with:
- ✅ MongoDB Atlas database (512MB FREE)
- ✅ Next.js + Vercel hosting (FREE)
- ✅ Progressive Web App support
- ✅ Yahoo Finance API integration
- ✅ Ticker autocomplete functionality

**Total Cost: $0/month!** 🚀

---

## 📞 **Need Help?**

- [MongoDB Atlas Support](https://www.mongodb.com/cloud/atlas/support)
- [Vercel Community Forum](https://vercel.community/)
- [Next.js Discord](https://discord.gg/nextjs)

**Happy deploying!** 🎊