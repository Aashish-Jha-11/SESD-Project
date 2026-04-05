import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { section: 'Main' },
  { path: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { path: '/marketplace', icon: '🏪', label: 'Marketplace' },
  { path: '/orders', icon: '📋', label: 'My Orders' },
  { path: '/trades', icon: '🔄', label: 'Trade History' },
  { path: '/wallet', icon: '💰', label: 'Wallet' },
  { section: 'Green Energy' },
  { path: '/carbon-credits', icon: '🌱', label: 'Carbon Credits' },
  { section: 'Operations' },
  { path: '/grid', icon: '🔌', label: 'Grid Operations' },
  { path: '/admin', icon: '⚙️', label: 'Admin Panel', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">⚡</span>
        <span>GreenGrid</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item, i) => {
          if ('section' in item && item.section) {
            return <div key={i} className="sidebar-section">{item.section}</div>;
          }
          if ('roles' in item && item.roles && user && !item.roles.includes(user.role)) {
            return null;
          }
          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">{user?.name?.[0] || '?'}</div>
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 12 }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
