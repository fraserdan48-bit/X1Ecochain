// Contact API for Vercel Serverless
// Validates basic fields and can send email via SendGrid when configured.

var SENDGRID_KEY = process.env.SENDGRID_API_KEY;
var SENDGRID_FROM = process.env.SENDGRID_FROM_EMAIL; // e.g. no-reply@yourdomain.com (must be verified)
var CONTACT_TO = process.env.CONTACT_TO_EMAIL; // site owner's email

var sgMail = null;
if (SENDGRID_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(SENDGRID_KEY);
  } catch (e) {
    console.warn('[contact] SendGrid module not available, falling back to echo response');
    sgMail = null;
  }
}

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  var body = req.body || {};
  try { if (typeof body === 'string' && body.trim()) body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: 'Invalid JSON' }); }

  var name = (body.name || '').trim();
  var email = (body.email || '').trim();
  var message = (body.message || '').trim();

  if (!name || !email || !message) return res.status(400).json({ error: 'Missing name, email or message' });

  // Do not accept sensitive keys
  var forbidden = ['mnemonic', 'seed', 'privateKey', 'phrase'];
  for (var i = 0; i < forbidden.length; i++) if (Object.prototype.hasOwnProperty.call(body, forbidden[i])) return res.status(400).json({ error: 'Sensitive data not accepted.' });

  // If SendGrid is configured and module available, send email
  if (sgMail && SENDGRID_FROM && CONTACT_TO) {
    var msg = {
      to: CONTACT_TO,
      from: SENDGRID_FROM,
      subject: 'Website Contact: ' + (name || 'Anonymous'),
      text: 'Contact form submission\n\nName: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message,
      html: '<p><strong>Name:</strong> ' + name + '</p><p><strong>Email:</strong> ' + email + '</p><p><strong>Message:</strong><br/>' + (message.replace(/\n/g, '<br/>')) + '</p>'
    };

    try {
      await sgMail.send(msg);
      return res.status(200).json({ status: 'ok', message: 'Contact received. Email sent.' });
    } catch (err) {
      console.error('[contact] SendGrid error', err && err.toString ? err.toString() : err);
      // fallthrough to safe acknowledgment
    }
  }

  // Fallback (or when SendGrid not configured): safe acknowledgement only
  return res.status(200).json({ status: 'ok', message: 'Contact received. (Email not sent: missing configuration or temporary error)' });
};
