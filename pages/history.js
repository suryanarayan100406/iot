import { useState, useEffect } from 'react';

export default function History() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/readings?limit=100');
      const data = await res.json();
      setRows(data.rows || []);
    }
    load();
  }, []);

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
