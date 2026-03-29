# Deploy X1 EcoChain Landing to Vercel

This guide walks you through deploying your Next.js backend + static landing to Vercel in production.

## Quick Summary

Your app is a Next.js project with:
- Frontend: `pages/index.js` renders your existing `index.html`
- Backend APIs: `/api/contact`, `/api/manual-attempt`
- Deployment target: Vercel (native Next.js support)

## Step 1: Push to GitHub

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial Next.js backend + landing page"
```

2. Create a GitHub repository (https://github.com/new)

3. Push to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/repo-name.git
git branch -M main
git push -u origin main
```

## Step 2: Connect to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Sign in or create a free account
3. Click "Add New..." → "Project"
4. Import your GitHub repo
5. Vercel auto-detects Next.js framework
6. Click "Deploy"

### Option B: Via Vercel CLI

1. Install Vercel CLI (if not already):
```bash
npm install -g vercel
```

2. Deploy from your project root:
```bash
vercel
```

3. Answer the prompts (select project name, framework=Next.js)

## Step 3: Configure Environment Variables

**In Vercel Dashboard:**

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following for SendGrid email support:
   - `SENDGRID_API_KEY` → your SendGrid API key
   - `SENDGRID_FROM_EMAIL` → verified sender email (e.g., no-reply@yourdomain.com)
   - `CONTACT_TO_EMAIL` → where you want contact form emails sent

### Getting SendGrid API Key

1. Sign up at https://sendgrid.com (free tier available)
2. Navigate to "API Keys" in settings
3. Create a new key (copy it and store securely)
4. Paste in Vercel Environment Variables

### Verify Sender Email

1. In SendGrid, go to "Sender Identities"
2. Add and verify your `SENDGRID_FROM_EMAIL` address
3. Only verified addresses can send emails

## Step 4: Redeploy with Environment Variables

After adding env vars:

1. In Vercel Dashboard, go to "Deployments"
2. Click the three dots on the latest deployment
3. Select "Redeploy"
4. Confirm → deployment rebuilds with env vars

## Step 5: Test Your Backend

Once deployed, test the API endpoints:

**Test manual-attempt endpoint:**
```bash
curl -i -X POST https://your-project.vercel.app/api/manual-attempt \
  -H "Content-Type: application/json" \
  -d '{"type":"manual-connect-test"}'
```

**Test contact endpoint (with email):**
```bash
curl -i -X POST https://your-project.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Hello from Vercel!"}'
```

Expected response (without SendGrid env vars configured):
```json
{ "status": "ok", "message": "Contact received. (Email not sent: missing configuration or temporary error)" }
```

With SendGrid env vars:
```json
{ "status": "ok", "message": "Contact received. Email sent." }
```

## Step 6: Custom Domain (Optional)

1. In Vercel Dashboard, go to "Domains"
2. Add your custom domain (e.g., x1ecochain.com)
3. Follow DNS instructions (update CNAME or A records)
4. SSL/HTTPS is automatic via Vercel

## Continuous Deployment

Any push to your GitHub `main` branch automatically triggers a new Vercel deployment. You'll see the deployment progress in Vercel Dashboard.

To disable auto-deploy:
- Vercel Dashboard → Project Settings → Git → Disable "Automatic Deployments"

## Troubleshooting

- **Build fails**: Check "Deployments" tab → click failed deployment for error logs
- **Env vars not found**: Ensure you added them to Vercel Environment Variables (not `.env` file)
- **API 404**: Verify you're hitting `/api/contact`, not `api/contact`
- **SendGrid emails not sending**: Check SENDGRID_FROM_EMAIL is verified in your SendGrid account

## Local Development (Alternative to Vercel CLI)

If you want to test locally before pushing:

From Command Prompt (not PowerShell):
```cmd
cd C:\Users\oluwa\OneDrive\Desktop\Testnet.x1ecochain
npm install
npm run dev
```

Visit http://localhost:3000 in your browser.

## Summary

You now have:
- A production-ready Next.js backend on Vercel
- Automatic deployments on every git push
- Email support via SendGrid
- Two main API endpoints for your landing page

Next steps:
- Add Web3 authentication (nonce + signature verification) for wallet sign-in
- Add persistent storage (Supabase/PostgreSQL) for contact submissions
- Monitor errors and performance in Vercel Dashboard
