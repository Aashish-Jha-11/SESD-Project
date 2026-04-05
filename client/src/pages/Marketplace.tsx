import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Marketplace() {
  const { user } = useAuth();
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [orderBook, setOrderBook] = useState<any>({ buyOrders: [], sellOrders: [] });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'BUY', quantityKwh: '', pricePerKwh: '', timeWindowStart: '', timeWindowEnd: '', sourceType: 'ANY' });
  const [error, setError] = useState('');

  useEffect(() => { loadZones(); }, []);

  useEffect(() => { if (selectedZone) loadOrderBook(); }, [selectedZone]);

  const loadZones = async () => {
    const z = await api.zones.getAll();
    setZones(z);
    if (z.length > 0) setSelectedZone(z[0].id);
  };

  const loadOrderBook = async () => {
    const book = await api.orders.getBook(selectedZone);
    setOrderBook(book);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.orders.create({
        ...form,
        gridZoneId: selectedZone,
        quantityKwh: Number(form.quantityKwh),
        pricePerKwh: Number(form.pricePerKwh),
      });
      setShowForm(false);
      setForm({ type: 'BUY', quantityKwh: '', pricePerKwh: '', timeWindowStart: '', timeWindowEnd: '', sourceType: 'ANY' });
      loadOrderBook();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Energy Marketplace 🏪</h1>
          <p className="page-subtitle">Buy and sell energy in real-time</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ New Order'}
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label className="form-label">Select Grid Zone</label>
        <select className="form-select" style={{ maxWidth: 300 }} value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
          {zones.map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: 16 }}>Create Order</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Order Type</label>
                <select className="form-select" value={form.type} onChange={e => update('type', e.target.value)}>
                  <option value="BUY">Buy Energy</option>
                  {user?.role === 'PROSUMER' && <option value="SELL">Sell Energy</option>}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Source Type</label>
                <select className="form-select" value={form.sourceType} onChange={e => update('sourceType', e.target.value)}>
                  <option value="ANY">Any</option>
                  <option value="SOLAR">Solar</option>
                  <option value="WIND">Wind</option>
                  <option value="HYDRO">Hydro</option>
                  <option value="BATTERY">Battery</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity (kWh)</label>
                <input className="form-input" type="number" step="0.1" min="0.1" value={form.quantityKwh} onChange={e => update('quantityKwh', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Price per kWh ($)</label>
                <input className="form-input" type="number" step="0.01" min="0.01" value={form.pricePerKwh} onChange={e => update('pricePerKwh', e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input className="form-input" type="datetime-local" value={form.timeWindowStart} onChange={e => update('timeWindowStart', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input className="form-input" type="datetime-local" value={form.timeWindowEnd} onChange={e => update('timeWindowEnd', e.target.value)} required />
              </div>
            </div>
            <button className="btn btn-primary" type="submit">Place Order</button>
          </form>
        </div>
      )}

      <div className="two-col">
        <div className="card">
          <div className="order-book-side">
            <h3><span style={{ color: 'var(--accent)' }}>●</span> Buy Orders ({orderBook.buyOrders.length})</h3>
          </div>
          <table>
            <thead><tr><th>Qty (kWh)</th><th>Price/kWh</th><th>Source</th><th>Status</th></tr></thead>
            <tbody>
              {orderBook.buyOrders.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No buy orders</td></tr>
              ) : orderBook.buyOrders.map((o: any) => (
                <tr key={o.id}>
                  <td>{Number(o.quantityKwh).toFixed(2)}</td>
                  <td>${Number(o.pricePerKwh).toFixed(4)}</td>
                  <td><span className="badge badge-blue">{o.sourceType}</span></td>
                  <td><span className="badge badge-green">{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="order-book-side">
            <h3><span style={{ color: 'var(--danger)' }}>●</span> Sell Orders ({orderBook.sellOrders.length})</h3>
          </div>
          <table>
            <thead><tr><th>Qty (kWh)</th><th>Price/kWh</th><th>Source</th><th>Status</th></tr></thead>
            <tbody>
              {orderBook.sellOrders.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sell orders</td></tr>
              ) : orderBook.sellOrders.map((o: any) => (
                <tr key={o.id}>
                  <td>{Number(o.quantityKwh).toFixed(2)}</td>
                  <td>${Number(o.pricePerKwh).toFixed(4)}</td>
                  <td><span className="badge badge-blue">{o.sourceType}</span></td>
                  <td><span className="badge badge-green">{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
