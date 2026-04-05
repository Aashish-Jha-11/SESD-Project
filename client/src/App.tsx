import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import MyOrders from './pages/MyOrders';
import TradeHistory from './pages/TradeHistory';
import WalletPage from './pages/WalletPage';
import CarbonCredits from './pages/CarbonCredits';
import GridOperator from './pages/GridOperator';
import AdminPanel from './pages/AdminPanel';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="trades" element={<TradeHistory />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="carbon-credits" element={<CarbonCredits />} />
        <Route path="grid" element={<GridOperator />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
