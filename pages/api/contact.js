// Next.js API Route: contact
// Uses SendGrid when configured via env vars. Rejects sensitive keys.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  let body = req.body || {};
  try { if (typeof body === 'string' && body.trim()) body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: 'Invalid JSON' }); }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();

  if (!name || !email || !message) return res.status(400).json({ error: 'Missing name, email or message' });

  const forbidden = ['mnemonic', 'seed', 'privateKey', 'phrase'];
  for (let i = 0; i < forbidden.length; i++) if (Object.prototype.hasOwnProperty.call(body, forbidden[i])) return res.status(400).json({ error: 'Sensitive data not accepted.' });

  const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
  const SENDGRID_FROM = process.env.SENDGRID_FROM_EMAIL;
  const CONTACT_TO = process.env.CONTACT_TO_EMAIL;

  if (SENDGRID_KEY && SENDGRID_FROM && CONTACT_TO) {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(SENDGRID_KEY);
      const msg = {
        to: CONTACT_TO,
        from: SENDGRID_FROM,
        subject: 'Website Contact: ' + (name || 'Anon'),
        text: 'Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message,
      };
      await sgMail.send(msg);
      return res.status(200).json({ status: 'ok', message: 'Contact received. Email sent.' });
    } catch (err) {
      console.error('[contact] SendGrid error', err && err.toString ? err.toString() : err);
      // Fallthrough to safe acknowledgement
    }
  }

  return res.status(200).json({ status: 'ok', message: 'Contact received. (Email not sent: missing configuration or temporary error)' });
}
