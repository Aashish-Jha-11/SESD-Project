import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function GridOperator() {
  const [zones, setZones] = useState<any[]>([]);

  useEffect(() => { loadZones(); }, []);

  const loadZones = async () => {
    const data = await api.zones.getAll();
    setZones(data);
  };

  const handleHalt = async (id: string) => {
    await api.zones.halt(id);
    loadZones();
  };

  const handleResume = async (id: string) => {
    await api.zones.resume(id);
    loadZones();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Grid Operations 🔌</h1>
        <p className="page-subtitle">Monitor and manage grid zones</p>
      </div>

      <div className="stats-grid">
        {zones.map((zone: any) => {
          const load = Number(zone.maxCapacityKw) > 0 ? (Number(zone.currentLoadKw) / Number(zone.maxCapacityKw)) * 100 : 0;
          const barClass = load > 80 ? 'danger' : load > 50 ? 'warning' : 'safe';

          return (
            <div key={zone.id} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <strong style={{ fontSize: 16 }}>{zone.name}</strong>
                <span className={`badge ${zone.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>{zone.status}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{load.toFixed(0)}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {Number(zone.currentLoadKw).toFixed(0)} / {Number(zone.maxCapacityKw).toFixed(0)} kW
              </div>
              <div className="load-bar" style={{ marginBottom: 16 }}>
                <div className={`load-bar-fill ${barClass}`} style={{ width: `${Math.min(load, 100)}%` }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {zone.status === 'ACTIVE' ? (
                  <button className="btn btn-danger btn-sm" onClick={() => handleHalt(zone.id)}>⚠️ Halt Zone</button>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => handleResume(zone.id)}>▶️ Resume</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
