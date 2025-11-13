cat > pages/readings.js <<'JS'
import { useState, useEffect } from 'react';

export default function ReadingsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/readings?limit=100');
        if (!res.ok) throw new Error('Failed to load readings: ' + res.status);
        const data = await res.json();
        if (mounted) setRows(data.rows || []);
      } catch (err) {
        console.error(err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{padding:20}}>Loading…</div>;
  if (error) return <div style={{padding:20,color:'red'}}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>History</h1>
      <table border={1} cellPadding={6} cellSpacing={0}>
        <thead>
          <tr><th>ID</th><th>Zone</th><th>EMF</th><th>Lat</th><th>Lon</th><th>Time</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.zone}</td>
              <td>{r.emf}</td>
              <td>{r.lat}</td>
              <td>{r.lon}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
JS

# show the first 40 lines to verify
sed -n '1,40p' pages/readings.js
