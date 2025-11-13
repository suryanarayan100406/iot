import { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';

if (typeof window !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'no-key',
    authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [emf, setEmf] = useState([]);

  useEffect(() => {
    const db = firebase.database();
    const alertsRef = db.ref('alerts');
    alertsRef.limitToLast(50).on('child_added', snap => {
      setAlerts(prev => [snap.val(), ...prev].slice(0, 200));
    });

    const emfRef = db.ref('emf_readings/latest');
    emfRef.limitToLast(200).on('child_added', snap => {
      setEmf(prev => [...prev.slice(-999), snap.val()]);
    });

    return () => {
      alertsRef.off();
      emfRef.off();
    };
  }, []);

  function logout() {
    localStorage.removeItem('fm_token');
    window.location.href = '/';
  }

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Fence Monitor Dashboard</h1>
        <div>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <section style={{ marginTop: 20 }}>
        <h2>Live Alerts</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {alerts.map((a, i) => (
            <li key={i} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
              <strong>Zone {a.zone ?? 'N/A'}</strong> — {a.severity} — EMF: {a.emf ?? 'N/A'} — {new Date(a.created_at).toLocaleString()}
              <div style={{ fontSize: 12, color: '#666' }}>{a.raw_message}</div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Live EMF (last 200)</h2>
        <div>Latest: {emf.length ? emf[emf.length-1].emf : '—'}</div>
        {/* Add Chart component here — simple placeholder */}
      </section>
    </div>
  );
}
