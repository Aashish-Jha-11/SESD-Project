const BASE = '/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  },
  orders: {
    create: (body: any) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
    getBook: (zoneId: string) => request(`/orders/book/${zoneId}`),
    getMy: () => request('/orders/my'),
    cancel: (id: string) => request(`/orders/${id}`, { method: 'DELETE' }),
  },
  trades: {
    getMy: () => request('/trades/my'),
    getAll: () => request('/trades'),
    getById: (id: string) => request(`/trades/${id}`),
  },
  wallet: {
    getBalance: () => request('/wallet'),
    addFunds: (amount: number) => request('/wallet/add-funds', { method: 'POST', body: JSON.stringify({ amount }) }),
  },
  energy: {
    getDashboard: () => request('/energy/dashboard'),
    getSources: () => request('/energy/sources'),
    addSource: (body: any) => request('/energy/sources', { method: 'POST', body: JSON.stringify(body) }),
    getMeters: () => request('/energy/meters'),
    getCarbonCredits: () => request('/energy/carbon-credits'),
  },
  zones: {
    getAll: () => request('/zones'),
    getStats: (id: string) => request(`/zones/${id}/stats`),
    getPrice: (id: string) => request(`/zones/${id}/price`),
    halt: (id: string) => request(`/zones/${id}/halt`, { method: 'POST' }),
    resume: (id: string) => request(`/zones/${id}/resume`, { method: 'POST' }),
  },
  notifications: {
    getAll: () => request('/notifications'),
    getUnreadCount: () => request('/notifications/unread-count'),
    markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
  },
  admin: {
    getUsers: () => request('/admin/users'),
    getStats: () => request('/admin/stats'),
    getAuditLogs: () => request('/admin/audit-logs'),
    deactivateUser: (id: string) => request(`/admin/users/${id}/deactivate`, { method: 'PUT' }),
    activateUser: (id: string) => request(`/admin/users/${id}/activate`, { method: 'PUT' }),
  },
  community: {
    getAll: () => request('/community'),
    getMy: () => request('/community/my'),
    getById: (id: string) => request(`/community/${id}`),
    getMembers: (id: string) => request(`/community/${id}/members`),
    create: (body: any) => request('/community', { method: 'POST', body: JSON.stringify(body) }),
    join: (id: string) => request(`/community/${id}/join`, { method: 'POST' }),
    leave: (id: string) => request(`/community/${id}/leave`, { method: 'POST' }),
  },
  priceAlerts: {
    getAll: () => request('/price-alerts'),
    create: (body: any) => request('/price-alerts', { method: 'POST', body: JSON.stringify(body) }),
    deactivate: (id: string) => request(`/price-alerts/${id}/deactivate`, { method: 'PUT' }),
    delete: (id: string) => request(`/price-alerts/${id}`, { method: 'DELETE' }),
  },
  analytics: {
    getPlatformStats: () => request('/analytics/platform'),
    getUserAnalytics: () => request('/analytics/me'),
    getEnergyTrends: (zoneId?: string, days?: number) => request(`/analytics/energy-trends?${zoneId ? `zoneId=${zoneId}&` : ''}days=${days || 7}`),
    getPriceTrends: (zoneId: string, days?: number) => request(`/analytics/price-trends/${zoneId}?days=${days || 7}`),
    getLeaderboard: (limit?: number) => request(`/analytics/leaderboard?limit=${limit || 10}`),
  },
};
