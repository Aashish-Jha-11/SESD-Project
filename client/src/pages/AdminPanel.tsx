import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<'users' | 'logs'>('users');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [u, s, l] = await Promise.all([api.admin.getUsers(), api.admin.getStats(), api.admin.getAuditLogs()]);
      setUsers(u);
      setStats(s);
      setLogs(l);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUser = async (id: string, isActive: boolean) => {
    if (isActive) await api.admin.deactivateUser(id);
    else await api.admin.activateUser(id);
    loadData();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Panel ⚙️</h1>
        <p className="page-subtitle">Platform management</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value">{stats?.totalUsers || 0}</div>
          <div className="stat-card-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value">{stats?.activeUsers || 0}</div>
          <div className="stat-card-label">Active Users</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('users')}>Users</button>
        <button className={`btn ${tab === 'logs' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('logs')}>Audit Logs</button>
      </div>

      {tab === 'users' && (
        <div className="card">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-blue">{u.role}</span></td>
                  <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggleUser(u.id, u.isActive)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'logs' && (
        <div className="card">
          <table>
            <thead><tr><th>Action</th><th>Entity</th><th>Time</th></tr></thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No audit logs</td></tr>
              ) : logs.map((l: any) => (
                <tr key={l.id}>
                  <td>{l.action}</td>
                  <td>{l.entityType}</td>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
