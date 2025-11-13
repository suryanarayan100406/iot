// pages/api/gsm-alert.js
import { rtdb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.body.token || req.headers['x-api-token'];
  if (!token || token !== process.env.API_TOKEN) return res.status(401).json({ error: 'Unauthorized' });

  const raw = (req.body.raw_message || req.body.message || '').toString();
  const source = req.body.source || null;

  const zoneMatch = raw.match(/zone\s*[:#\-\s]?\s*(\d+)/i);
  const emfMatch = raw.match(/EMF[:\s]*([0-9]*\.?[0-9]+)/i);
  const breachMatch = raw.match(/breach|intrud|alarm|alert|unauthor/i);
  const safeMatch = raw.match(/\bsafe\b/i);

  const zone = zoneMatch ? parseInt(zoneMatch[1]) : null;
  const emf = emfMatch ? parseFloat(emfMatch[1]) : null;
  let severity = 'medium';
  if (breachMatch) severity = 'high';
  if (safeMatch) severity = 'low';

  try {
    const payload = {
      zone,
      emf,
      severity,
      raw_message: raw,
      source,
      created_at: new Date().toISOString()
    };

    // push to RTDB `alerts`
    const ref = await rtdb.ref('/alerts').push(payload);
    const pushKey = ref.key;

    // update per-zone pointers (optional)
    if (zone !== null) {
      await rtdb.ref(`/zones/${zone}/last_alert`).set({ ...payload, id: pushKey });
    }

    return res.json({ status: 'ok', id: pushKey });
  } catch (err) {
    console.error('gsm-alert firebase error', err);
    return res.status(500).json({ error: 'firebase error' });
  }
}
