import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Analytics() {
  const { user } = useAuth();
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [tab, setTab] = useState<'personal' | 'platform' | 'leaderboard'>('personal');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [p, u, l] = await Promise.all([
        api.analytics.getPlatformStats(),
        api.analytics.getUserAnalytics(),
        api.analytics.getLeaderboard(),
      ]);
      setPlatformStats(p);
      setUserStats(u);
      setLeaderboard(l);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics & Reports</h1>
        <p className="page-subtitle">Energy trends, earnings, and carbon savings</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button className={`btn ${tab === 'personal' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab('personal')}>
          My Analytics
        </button>
        <button className={`btn ${tab === 'platform' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab('platform')}>
          Platform Stats
        </button>
        <button className={`btn ${tab === 'leaderboard' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab('leaderboard')}>
          Leaderboard
        </button>
      </div>

      {tab === 'personal' && userStats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon">🔄</div>
              <div className="stat-card-value">{userStats.totalTrades}</div>
              <div className="stat-card-label">Total Trades</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">⬇️</div>
              <div className="stat-card-value">{userStats.totalBoughtKwh}</div>
              <div className="stat-card-label">kWh Bought</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">⬆️</div>
              <div className="stat-card-value">{userStats.totalSoldKwh}</div>
              <div className="stat-card-label">kWh Sold</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">💵</div>
              <div className="stat-card-value">${userStats.netEarnings}</div>
              <div className="stat-card-label">Net Earnings</div>
              <div className={`stat-card-change ${userStats.netEarnings >= 0 ? 'positive' : 'negative'}`}>
                {userStats.netEarnings >= 0 ? '↑ Profitable' : '↓ Net spend'}
              </div>
            </div>
          </div>

          <div className="two-col">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">💰 Financial Summary</h2>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Spent</span>
                  <strong style={{ color: 'var(--danger)' }}>${userStats.totalSpent}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Earned</span>
                  <strong style={{ color: 'var(--accent)' }}>${userStats.totalEarned}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Net Earnings</span>
                  <strong style={{ color: userStats.netEarnings >= 0 ? 'var(--accent)' : 'var(--danger)' }}>${userStats.netEarnings}</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🌱 Carbon Impact</h2>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Green Energy Credits</span>
                  <strong>{userStats.carbonCreditsKwh} kWh</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>CO2 Offset</span>
                  <strong style={{ color: 'var(--accent)' }}>{userStats.co2OffsetKg} kg</strong>
                </div>
              </div>
            </div>
          </div>

          {userStats.monthlyData?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📅 Monthly Breakdown</h2>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Bought (kWh)</th>
                    <th>Sold (kWh)</th>
                    <th>Spent</th>
                    <th>Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.monthlyData.map((m: any) => (
                    <tr key={m.month}>
                      <td>{m.month}</td>
                      <td>{m.boughtKwh}</td>
                      <td>{m.soldKwh}</td>
                      <td style={{ color: 'var(--danger)' }}>${m.spent}</td>
                      <td style={{ color: 'var(--accent)' }}>${m.earned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'platform' && platformStats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon">👥</div>
              <div className="stat-card-value">{platformStats.totalUsers}</div>
              <div className="stat-card-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">🔄</div>
              <div className="stat-card-value">{platformStats.totalTrades}</div>
              <div className="stat-card-label">Total Trades</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">✅</div>
              <div className="stat-card-value">{platformStats.settledTrades}</div>
              <div className="stat-card-label">Settled Trades</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon">📋</div>
              <div className="stat-card-value">{platformStats.totalOrders}</div>
              <div className="stat-card-label">Total Orders</div>
            </div>
          </div>

          <div className="two-col">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">💰 Financial Metrics</h2>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Trading Volume</span>
                  <strong>${platformStats.totalVolume}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Platform Revenue (2% fee)</span>
                  <strong style={{ color: 'var(--accent)' }}>${platformStats.totalRevenue}</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🌍 Environmental Impact</h2>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Green Energy Traded</span>
                  <strong>{platformStats.totalCarbonKwh} kWh</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total CO2 Offset</span>
                  <strong style={{ color: 'var(--accent)' }}>{platformStats.co2OffsetKg} kg</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'leaderboard' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🏆 Green Energy Leaderboard</h2>
          </div>
          {leaderboard.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🏆</div>
              <h3>No data yet</h3>
              <p>Start trading green energy to appear on the leaderboard</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Green Energy (kWh)</th>
                  <th>CO2 Offset (kg)</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry: any, index: number) => (
                  <tr key={entry.userId}>
                    <td>
                      <span style={{ fontSize: 18 }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </td>
                    <td>
                      <strong>{entry.name}</strong>
                      {entry.userId === user?.id && <span className="badge badge-green" style={{ marginLeft: 8 }}>You</span>}
                    </td>
                    <td>{entry.totalKwh}</td>
                    <td style={{ color: 'var(--accent)' }}>{entry.co2OffsetKg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
