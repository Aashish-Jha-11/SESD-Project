import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', gridZoneId: '' });
  const [tab, setTab] = useState<'all' | 'my'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [g, m, z] = await Promise.all([
        api.community.getAll(),
        api.community.getMy(),
        api.zones.getAll(),
      ]);
      setGroups(g);
      setMyGroups(m);
      setZones(z);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.community.create(form);
      setShowCreate(false);
      setForm({ name: '', description: '', gridZoneId: '' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      await api.community.join(groupId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLeave = async (groupId: string) => {
    try {
      await api.community.leave(groupId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const myGroupIds = new Set(myGroups.map((g: any) => g.id));
  const displayGroups = tab === 'all' ? groups : myGroups;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Community Microgrids</h1>
        <p className="page-subtitle">Join or create energy co-operatives in your grid zone</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">🏘️</div>
          <div className="stat-card-value">{groups.length}</div>
          <div className="stat-card-label">Total Communities</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value">{myGroups.length}</div>
          <div className="stat-card-label">My Communities</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🔌</div>
          <div className="stat-card-value">{zones.length}</div>
          <div className="stat-card-label">Grid Zones</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: 12 }}>
            <button className={`btn ${tab === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab('all')}>
              All Communities
            </button>
            <button className={`btn ${tab === 'my' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab('my')}>
              My Communities
            </button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(!showCreate)}>
            + New Community
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} style={{ marginBottom: 24, padding: 20, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Community Name</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Grid Zone</label>
                <select className="form-select" value={form.gridZoneId} onChange={(e) => setForm({ ...form, gridZoneId: e.target.value })} required>
                  <option value="">Select zone</option>
                  {zones.map((z: any) => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit">Create Community</button>
          </form>
        )}

        {displayGroups.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏘️</div>
            <h3>No communities {tab === 'my' ? 'joined yet' : 'available'}</h3>
            <p>{tab === 'my' ? 'Join a community or create a new one' : 'Be the first to create a community'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {displayGroups.map((group: any) => (
              <div key={group.id} className="grid-zone-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: 16 }}>{group.name}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {group.gridZone?.name || 'Unknown zone'}
                    </div>
                  </div>
                  <span className="badge badge-green">{group.members?.length || 0} members</span>
                </div>
                {group.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{group.description}</p>
                )}
                <div style={{ marginTop: 12 }}>
                  {myGroupIds.has(group.id) ? (
                    <button className="btn btn-danger btn-sm" onClick={() => handleLeave(group.id)}>Leave</button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleJoin(group.id)}>Join Community</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
