import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function CarbonCredits() {
  const [data, setData] = useState<any>({ credits: [], total: 0 });

  useEffect(() => {
    api.energy.getCarbonCredits().then(setData).catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Carbon Credits 🌱</h1>
        <p className="page-subtitle">Your green energy certificates</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">🌍</div>
          <div className="stat-card-value">{data.total?.toFixed(1)}</div>
          <div className="stat-card-label">Total kWh of Green Energy</div>
          <div className="stat-card-change positive">Reducing carbon footprint</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📜</div>
          <div className="stat-card-value">{data.credits?.length || 0}</div>
          <div className="stat-card-label">Certificates Issued</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🌿</div>
          <div className="stat-card-value">{(data.total * 0.4).toFixed(1)} kg</div>
          <div className="stat-card-label">CO₂ Offset</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Certificate History</h2>
        </div>
        <table>
          <thead><tr><th>Certificate</th><th>kWh Generated</th><th>Issued Date</th></tr></thead>
          <tbody>
            {data.credits?.length === 0 ? (
              <tr><td colSpan={3}><div className="empty-state"><div className="icon">🌱</div><h3>No certificates yet</h3><p>Sell renewable energy to earn carbon credits</p></div></td></tr>
            ) : data.credits?.map((c: any) => (
              <tr key={c.id}>
                <td><span className="badge badge-green">{c.certificateHash}</span></td>
                <td>{Number(c.kwhGenerated).toFixed(2)} kWh</td>
                <td>{new Date(c.issuedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
