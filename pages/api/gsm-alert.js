import { getPool } from './db';
import { rtdb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.body.token || req.headers['x-api-token'];
  if (!token || token !== process.env.API_TOKEN) return res.status(401).json({ error: 'Unauthorized' });

  const raw = req.body.raw_message || req.body.message || '';
  const source = req.body.source || null;

  // parse zone and emf
  const zoneMatch = raw.match(/zone\s*[:#\-\s]?\s*(\d+)/i);
  const emfMatch = raw.match(/EMF[:\s]*([0-9]*\.?[0-9]+)/i);
  const breachMatch = raw.match(/breach|intrud|alarm|alert|unauthor/i);
  const safeMatch = raw.match(/\bsafe\b/i);

  const zone = zoneMatch ? parseInt(zoneMatch[1]) : null;
  const emf = emfMatch ? parseFloat(emfMatch[1]) : null;
  let severity = 'medium';
  if (breachMatch) severity = 'high';
  if (safeMatch) severity = 'low';

  const pool = await getPool();
  try {
    const [result] = await pool.query(
      'INSERT INTO alerts (zone, emf, severity, raw_message, source) VALUES (?, ?, ?, ?, ?)',
      [zone, emf, severity, raw, source]
    );

    const alertId = result.insertId;

    const payload = {
      id: alertId,
      zone,
      emf,
      severity,
      raw_message: raw,
      source,
      created_at: new Date().toISOString()
    };

    await rtdb.ref('/alerts').push(payload);

    return res.json({ status: 'ok', id: alertId });
  } catch (err) {
    console.error('gsm-alert error', err);
    return res.status(500).json({ status: 'error', message: 'DB error' });
  }
}
