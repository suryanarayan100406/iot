import { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale } from 'chart.js';
Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale);

export default function EMFChart({ data }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => new Date(d.created_at).toLocaleTimeString()),
        datasets: [{ label: 'EMF', data: data.map(d => d.emf) }]
      },
      options: { responsive: true }
    });
    return () => chart.destroy();
  }, [data]);

  return <canvas ref={canvasRef} />;
}
