import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function TradeHistory() {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    api.trades.getMy().then(setTrades).catch(console.error);
  }, []);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { PENDING: 'badge-yellow', DELIVERED: 'badge-blue', SETTLED: 'badge-green', DISPUTED: 'badge-red', CANCELLED: 'badge-red' };
    return map[status] || 'badge-yellow';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Trade History 🔄</h1>
        <p className="page-subtitle">Your completed and pending trades</p>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Qty (kWh)</th><th>Price/kWh</th><th>Total</th><th>Status</th><th>Executed</th></tr></thead>
          <tbody>
            {trades.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><div className="icon">🔄</div><h3>No trades yet</h3><p>Trades will appear here when your orders are matched</p></div></td></tr>
            ) : trades.map((t: any) => (
              <tr key={t.id}>
                <td>{Number(t.quantityKwh).toFixed(2)}</td>
                <td>${Number(t.pricePerKwh).toFixed(4)}</td>
                <td>${Number(t.totalAmount).toFixed(2)}</td>
                <td><span className={`badge ${statusBadge(t.status)}`}>{t.status}</span></td>
                <td>{new Date(t.executedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
