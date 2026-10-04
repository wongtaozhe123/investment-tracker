# 🚀 MongoDB Atlas Setup Guide - Investment Tracker

## ✅ **What You'll Get**
- FREE M0 Cluster (512MB storage)
- Production-ready security settings  
- Real connection string for Next.js app
- Automatic backups & monitoring
- No credit card required!

---

## 🔗 **Quick Links**

1. [MongoDB Atlas Sign Up](https://www.mongodb.com/cloud/atlas/register)
2. [Atlas Dashboard](https://cloud.mongodb.com/)
3. [Free Tier Docs](https://www.mongodb.com/docs/atlas/tutorial/create-free-cluster/)

---

## 📝 **Step-by-Step Setup (10 minutes)**

### Step 1: Create Account & Project (2 min)

1. Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)**
2. Sign up with Google, GitHub, or email
3. Click **"Create a Cluster"**
4. Select **FREE TIER (M0)** - 512MB storage
5. Name your project: `investment-tracker`

### Step 2: Create Database User (2 min)

In Atlas Dashboard → **Database Access**:
1. Click **"Add New Database User"**
2. Username: `investor_admin` (or any name you like)
3. Password: Generate a strong password (**SAVE IT!**)
4. Roles: Select **"Read and write to any database"**
5. Click **"Add User"**

### Step 3: Create Cluster (3 min)

In Atlas Dashboard → **Deploy a Cluster**:
1. Choose **FREE TIER (M0)** - 512MB storage
2. Select region closest to you (**Singapore** for Kuala Lumpur!)
3. Click **"Review and Deploy"**
4. Wait ~2-3 minutes while cluster provisions

### Step 4: Configure Network Access (2 min)

In Atlas Dashboard → **Network Access**:
1. Click **"Add IP Address"**
2. Select **"Allow Access from Anywhere" (0.0.0.0/0)** for development
   - For production, add your specific IPs only
3. Click **"Confirm"**

### Step 5: Get Connection String (1 min)

In Atlas Dashboard → **Database** → **Connect**:
1. Click the **connection string icon** (🔗)
2. Select **Node.js driver**
3. Copy the connection string

---

## 🔑 **Your Connection String Format**

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/investment-tracker?retryWrites=true&w=majority&appName=InvestmentTracker
```

Example:
```
mongodb+srv://investor_admin:MySecureP@ss123!@cluster0.abc123.mongodb.net/investment-tracker?retryWrites=true&w=majority&appName=InvestmentTracker
```

**⚠️ IMPORTANT**: Replace `<password>` with your actual password from Step 2!

---

## 💾 **Save Your Credentials Securely**

### Update `.env.local` file:

```bash
# MongoDB Atlas Connection String (REPLACE WITH YOUR ACTUAL STRING)
MONGODB_URI=mongodb+srv://investor_admin:YourPasswordHere@cluster0.xxxxx.mongodb.net/investment-tracker?retryWrites=true&w=majority&appName=InvestmentTracker

# Other environment variables...
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
```

### For Production (Vercel):

Add as environment variable in Vercel Dashboard → Settings → Environment Variables.

---

## ✅ **Test Your Connection**

Create `test-mongodb.js`:

```javascript
const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  try {
    const client = new MongoClient(uri, { 
      serverSelectionTimeoutMS: 5000 
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas!');
    
    // Test database access
    const db = client.db('investment-tracker');
    const collections = await db.listCollections().toArray();
    console.log(`📊 Collections: ${collections.length}`);
    
    await client.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

Run it:
```bash
node test-mongodb.js
```

---

## 🎯 **Verify Your Setup**

After updating `.env.local`:

1. Stop dev server (Ctrl+C)
2. Restart: `npm run dev`
3. Check console for MongoDB connection errors
4. If successful, you'll see your portfolio data persist across restarts!

---

## 🔒 **Security Best Practices**

### For Production Deployment:

1. **Replace "Allow Access from Anywhere"** with specific IPs only
2. **Use Vercel's environment variables** (never commit `.env` to Git)
3. **Enable Atlas IP whitelist** in production
4. **Rotate database user password** every 90 days

### Connection String Security:

- Never share your connection string publicly
- Use separate users for different purposes (admin, read-only, etc.)
- Enable audit logging in Atlas settings

---

## 📊 **Free Tier Limits (M0)**

| Resource | Limit | Is It Enough? |
|----------|-------|---------------|
| Storage | 512 MB | ✅ Yes for < 100 holdings |
| RAM | Shared | ✅ Yes for small apps |
| CPU | Shared | ✅ Yes for development/small production |
| Network I/O | 1 GB/sec | ✅ More than enough |
| Connections | Unlimited | ✅ Perfect for Next.js |

**Upgrade Path**: M10 ($97/mo) when you need more storage.

---

## 🚀 **Next Steps After MongoDB Setup**

1. ✅ Update `.env.local` with your connection string
2. ✅ Test connection locally (`npm run dev`)
3. ✅ Push code to GitHub
4. ✅ Deploy to Vercel (see DEPLOYMENT_GUIDE.md)
5. ✅ Add environment variables in Vercel dashboard

---

## 🔗 **Useful Links**

- [MongoDB Atlas Pricing](https://www.mongodb.com/cloud/atlas/pricing)
- [Atlas Security Best Practices](https://www.mongodb.com/docs/atlas/security/)
- [Node.js Driver Documentation](https://www.mongodb.com/docs/drivers/node/current/)
- [Vercel MongoDB Integration](https://vercel.com/docs/concepts/functions/serverless-functions/databases/mongodb)

---

## 💡 **Pro Tips**

1. **Use Atlas Search**: Free tier includes basic search capabilities
2. **Enable Backups**: Automatic backups included in free tier
3. **Monitor Usage**: Check dashboard for storage/CPU usage
4. **Backup Strategy**: Export data regularly using MongoDB Compass or CLI
5. **Connection Pooling**: Next.js handles this automatically with the official driver

---

## 🎉 **Total Cost: $0/month!**

Your MongoDB Atlas cluster is FREE and ready to use!

**Ready?** Follow the steps above, then update your `.env.local` file with the connection string from Atlas.