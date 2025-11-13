import { getPool } from './db';

export default async function handler(req, res) {
  const q = req.query;
  const limit = parseInt(q.limit) || 100;
  const zone = q.zone ? parseInt(q.zone) : null;

  const pool = await getPool();
  try {
    let sql = 'SELECT * FROM emf_readings';
    const params = [];
    if (zone) {
      sql += ' WHERE zone = ?';
      params.push(zone);
    }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.query(sql, params);
    return res.json({ rows });
  } catch (err) {
    console.error('readings error', err);
    return res.status(500).json({ error: 'DB error' });
  }
}
