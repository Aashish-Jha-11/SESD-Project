import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');

  useEffect(() => { loadWallet(); }, []);

  const loadWallet = async () => {
    const data = await api.wallet.getBalance();
    setWallet(data);
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.wallet.addFunds(Number(amount));
      setAmount('');
      loadWallet();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Wallet 💰</h1>
        <p className="page-subtitle">Manage your trading balance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">💵</div>
          <div className="wallet-balance">${wallet?.balance?.toFixed(2) || '0.00'}</div>
          <div className="stat-card-label">Available Balance</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🔒</div>
          <div className="stat-card-value">${wallet?.escrow?.toFixed(2) || '0.00'}</div>
          <div className="stat-card-label">Held in Escrow</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📊</div>
          <div className="stat-card-value">${wallet?.total?.toFixed(2) || '0.00'}</div>
          <div className="stat-card-label">Total Balance</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 400 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>Add Funds</h2>
        <form onSubmit={handleAddFunds}>
          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input className="form-input" type="number" min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" required />
          </div>
          <button className="btn btn-primary" type="submit">Add Funds</button>
        </form>
      </div>
    </div>
  );
}
