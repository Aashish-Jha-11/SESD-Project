import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [energy, setEnergy] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [e, w, z, n] = await Promise.all([
        api.energy.getDashboard(),
        api.wallet.getBalance(),
        api.zones.getAll(),
        api.notifications.getAll(),
      ]);
      setEnergy(e);
      setWallet(w);
      setZones(z);
      setNotifications(n);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name} 👋</h1>
        <p className="page-subtitle">Here's your energy trading overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">⚡</div>
          <div className="stat-card-value">{energy?.totalProduction?.toFixed(1) || '0'}</div>
          <div className="stat-card-label">Energy Produced (kWh)</div>
          <div className="stat-card-change positive">↑ Active production</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🔌</div>
          <div className="stat-card-value">{energy?.totalConsumption?.toFixed(1) || '0'}</div>
          <div className="stat-card-label">Energy Consumed (kWh)</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value">${wallet?.balance?.toFixed(2) || '0.00'}</div>
          <div className="stat-card-label">Wallet Balance</div>
          {wallet?.escrow > 0 && <div className="stat-card-change" style={{ color: 'var(--warning)' }}>${wallet.escrow.toFixed(2)} in escrow</div>}
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🌱</div>
          <div className="stat-card-value">{energy?.carbonCredits?.toFixed(1) || '0'}</div>
          <div className="stat-card-label">Carbon Credits Earned</div>
          <div className="stat-card-change positive">Green energy champion</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🔌 Grid Zones</h2>
          </div>
          {zones.length === 0 ? (
            <div className="empty-state"><p>No zones available</p></div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {zones.map((zone: any) => {
                const load = Number(zone.maxCapacityKw) > 0
                  ? (Number(zone.currentLoadKw) / Number(zone.maxCapacityKw)) * 100
                  : 0;
                const barClass = load > 80 ? 'danger' : load > 50 ? 'warning' : 'safe';
                return (
                  <div key={zone.id} className="grid-zone-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{zone.name}</strong>
                      <span className={`badge badge-${zone.status === 'ACTIVE' ? 'green' : 'red'}`}>{zone.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {Number(zone.currentLoadKw).toFixed(0)} / {Number(zone.maxCapacityKw).toFixed(0)} kW
                    </div>
                    <div className="load-bar">
                      <div className={`load-bar-fill ${barClass}`} style={{ width: `${Math.min(load, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🔔 Recent Notifications</h2>
          </div>
          {notifications.length === 0 ? (
            <div className="empty-state"><p>No notifications yet</p></div>
          ) : (
            notifications.slice(0, 5).map((n: any) => (
              <div key={n.id} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 0 }}>
        <div className="card-header">
          <h2 className="card-title">📊 Platform Info</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Energy Sources</span><br /><strong>{energy?.sources || 0}</strong></div>
          <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Smart Meters</span><br /><strong>{energy?.meters || 0}</strong></div>
          <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Net Energy</span><br /><strong>{energy?.netEnergy?.toFixed(2) || '0'} kWh</strong></div>
        </div>
      </div>
    </div>
  );
}
