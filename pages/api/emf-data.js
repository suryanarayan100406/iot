// pages/api/emf-data.js
import { rtdb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.body.token || req.headers['x-api-token'];
  if (!token || token !== process.env.API_TOKEN) return res.status(401).json({ error: 'Unauthorized' });

  const zone = req.body.zone ? parseInt(req.body.zone) : null;
  const lat = req.body.lat ? parseFloat(req.body.lat) : null;
  const lon = req.body.lon ? parseFloat(req.body.lon) : null;
  const emf = req.body.emf ? parseFloat(req.body.emf) : null;

  if (emf === null || isNaN(emf)) return res.status(400).json({ error: 'Invalid EMF value' });

  try {
    const payload = { zone, lat, lon, emf, created_at: new Date().toISOString() };

    // push to EMF readings list
    const ref = await rtdb.ref('/emf_readings').push(payload);
    const key = ref.key;

    // update zone latest
    if (zone !== null) {
      await rtdb.ref(`/zones/${zone}/latest_emf`).set({ ...payload, id: key });
    }

    // optionally keep a "latest" queue for charts
    await rtdb.ref('/emf_readings/latest').push({ ...payload, id: key });

    return res.json({ status: 'ok', id: key });
  } catch (err) {
    console.error('emf-data firebase error', err);
    return res.status(500).json({ error: 'firebase error' });
  }
}
