import { getPool } from './db';
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

  const pool = await getPool();
  try {
    const [result] = await pool.query(
      'INSERT INTO emf_readings (zone, lat, lon, emf) VALUES (?, ?, ?, ?)',
      [zone, lat, lon, emf]
    );

    const id = result.insertId;
    const payload = { id, zone, lat, lon, emf, created_at: new Date().toISOString() };

    await rtdb.ref(`/emf_readings/latest`).push(payload);

    return res.json({ status: 'ok', id });
  } catch (err) {
    console.error('emf-data error', err);
    return res.status(500).json({ status: 'error' });
  }
}
