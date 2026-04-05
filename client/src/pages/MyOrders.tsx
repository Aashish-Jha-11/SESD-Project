import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    const data = await api.orders.getMy();
    setOrders(data);
  };

  const handleCancel = async (id: string) => {
    try {
      await api.orders.cancel(id);
      loadOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Orders 📋</h1>
        <p className="page-subtitle">Track and manage your energy orders</p>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Type</th><th>Qty (kWh)</th><th>Price/kWh</th><th>Source</th><th>Status</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={7}><div className="empty-state"><div className="icon">📋</div><h3>No orders yet</h3><p>Create your first order in the Marketplace</p></div></td></tr>
            ) : orders.map((o: any) => (
              <tr key={o.id}>
                <td><span className={`badge ${o.type === 'BUY' ? 'badge-green' : 'badge-red'}`}>{o.type}</span></td>
                <td>{Number(o.quantityKwh).toFixed(2)}</td>
                <td>${Number(o.pricePerKwh).toFixed(4)}</td>
                <td>{o.sourceType}</td>
                <td><span className={`badge ${o.status === 'ACTIVE' ? 'badge-green' : o.status === 'MATCHED' ? 'badge-blue' : 'badge-yellow'}`}>{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  {o.status === 'ACTIVE' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(o.id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
