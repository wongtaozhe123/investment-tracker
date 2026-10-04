#!/bin/bash

# Investment Tracker - Deploy to Production
echo "🚀 Deploying Investment Tracker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "💡 Create a .env file with your production credentials:"
    echo ""
    cat << 'EOF'
NODE_ENV=production
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-a-random-secret-key-here

# WebAuthn
WEBAUTHN_RP_ID=yourapp.vercel.app
WEBAUTHN_RP_NAME="Investment Tracker"

# MongoDB Atlas (FREE tier - 512MB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/investment-tracker?retryWrites=true&w=majority

# Yahoo Finance API
NEXT_PUBLIC_YAHOO_FINANCE_SEARCH_URL=https://query1.finance.yahoo.com/v1/finance/search
NEXT_PUBLIC_YAHOO_FINANCE_QUOTE_URL=https://query2.finance.yahoo.com/v8/finance/chart
EOF
    exit 1
fi

echo "✅ Environment variables loaded"

# Build the app
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📦 Your app is ready to deploy!"
    echo ""
    echo "Next steps:"
    echo "1. Push code to GitHub/GitLab"
    echo "2. Connect your repo to Vercel (vercel.com)"
    echo "3. Add environment variables in Vercel dashboard"
    echo "4. Deploy!"
    echo ""
    echo "🔗 Vercel Setup: https://vercel.com/new/clone?repository-url=git@github.com:YOUR_USERNAME/investment-tracker.git"
else
    echo ""
    echo "❌ Build failed! Check the errors above."
    exit 1
fi