import { getPool } from './db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  const pool = await getPool();
  const [rows] = await pool.query('SELECT id, username, password FROM users WHERE username = ? LIMIT 1', [username]);
  if (!rows || rows.length === 0) return res.status(401).json({ error: 'Invalid' });

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid' });

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return res.json({ status: 'ok', token });
}
