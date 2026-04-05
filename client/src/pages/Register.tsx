import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'CONSUMER' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.auth.register(form);
      login(res.token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>⚡ GreenGrid</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="Email address" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 6 characters" required />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={e => update('role', e.target.value)}>
              <option value="CONSUMER">Consumer</option>
              <option value="PROSUMER">Prosumer (Producer + Consumer)</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Create Account</button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
