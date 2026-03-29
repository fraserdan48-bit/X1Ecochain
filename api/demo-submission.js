// Demo submission endpoint for Vercel Serverless
// Purpose: accept non-sensitive demo payloads. Rejects any seed phrase / mnemonic.

module.exports = function (req, res) {
  // Allow CORS for quick testing (restrict in production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  var body = req.body || {};

  // Defensive parsing if body not populated by platform
  try {
    if (typeof body === 'string' && body.trim()) body = JSON.parse(body);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // Reject any attempt to send mnemonic/seed/phrase/privateKey
  var forbiddenKeys = ['mnemonic', 'seed', 'seedPhrase', 'seed_phrase', 'privateKey', 'private_key', 'phrase'];
  for (var i = 0; i < forbiddenKeys.length; i++) {
    var k = forbiddenKeys[i];
    if (Object.prototype.hasOwnProperty.call(body, k)) {
      return res.status(400).json({ error: 'Sensitive data not accepted. Do not submit seed phrases or private keys.' });
    }
  }

  // Simple validation: require a 'type' or 'event' field
  if (!body.type && !body.event) {
    return res.status(400).json({ error: 'Missing required "type" or "event" field' });
  }

  // For demo usage we simply echo back a safe acknowledgment. Do NOT store sensitive data.
  return res.status(200).json({ status: 'ok', message: 'Demo submission received', received: { type: body.type || body.event } });
};
