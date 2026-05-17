// Frontend API Client

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we have a network error (no response) provide in-frontend mock data
    const isNetworkError = !error.response && error.request;
    if (isNetworkError && originalRequest && originalRequest.url) {
      const url = originalRequest.url as string;
      const method = (originalRequest.method || 'get').toLowerCase();

      const getMock = () => {
        // Basic sample data used across pages
        const sampleTransactions = [
          { id: 'TXN-001', sourceAccountId: 'ACC-2024-001', destinationAccountId: 'ACC-2024-042', amount: 5234, type: 'transfer', status: 'completed', timestamp: new Date().toISOString() },
          { id: 'TXN-002', sourceAccountId: 'ACC-2024-089', destinationAccountId: 'ACC-2024-001', amount: 892, type: 'deposit', status: 'completed', timestamp: new Date().toISOString() },
          { id: 'TXN-003', sourceAccountId: 'ACC-2024-156', destinationAccountId: 'EXT-XYZ-789', amount: 3567, type: 'withdrawal', status: 'pending', timestamp: new Date().toISOString() },
        ];

        const sampleAlerts = [
          { _id: 'AL-001', type: 'rapid_txn', severity: 'high', title: 'Rapid transactions detected', description: 'Multiple rapid transfers', accountId: 'ACC-2024-001', fraudScore: 0.78, status: 'open', createdAt: new Date().toISOString() },
          { _id: 'AL-002', type: 'geo_anomaly', severity: 'medium', title: 'Unusual location', description: 'Transaction from unexpected country', accountId: 'ACC-2024-042', fraudScore: 0.45, status: 'investigating', createdAt: new Date().toISOString() },
        ];

        const sampleUser = { id: 'demo', email: 'demo@local', fullName: 'Demo User', role: 'analyst' };

        // Analytics mocks
        const stats = { totalTransactions: 12453, flaggedTransactions: 47, fraudRate: 0.38, totalAccounts: 284, highRiskAccounts: 24, openAlerts: 12, criticalAlerts: 8 };
        const trends = Array.from({ length: 7 }).map((_, i) => ({ date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString(), total: 180 + i * 5, flagged: 3 + i, percentage: ((3 + i) / (180 + i * 5)) * 100 }));
        const distribution = { critical: 8, high: 24, medium: 65, low: 187, total: 284 };
        const topSuspicious = [{ id: 'ACC-010', riskScore: 0.92, status: 'active', balance: 12000 }, { id: 'ACC-099', riskScore: 0.78, status: 'active', balance: 4300 }];

        // Match endpoints
        if (url.includes('/auth/me')) {
          return { data: { data: { user: sampleUser } }, status: 200 };
        }

        if (url.includes('/transactions') && method === 'get' && url === '/transactions') {
          return { data: { data: { transactions: sampleTransactions } }, status: 200 };
        }

        if (url.includes('/transactions/account') && url.includes('/transactions')) {
          return { data: { data: { transactions: sampleTransactions } }, status: 200 };
        }

        if (url.includes('/transactions/account')) {
          const accountId = url.split('/').pop();
          return { data: { data: { account: { _id: 'acct-' + accountId, accountId: accountId || 'ACC-001', accountHolder: 'Demo Holder', accountNumber: '1234567890', status: 'active', balance: 5234, kycStatus: 'verified', createdAt: new Date().toISOString(), riskScore: 0.12 } } }, status: 200 };
        }

        if (url.includes('/alerts')) {
          return { data: { data: { alerts: sampleAlerts } }, status: 200 };
        }

        if (url.includes('/analytics/fraud-stats')) {
          return { data: { data: { stats } }, status: 200 };
        }

        if (url.includes('/analytics/trends')) {
          return { data: { data: { trends } }, status: 200 };
        }

        if (url.includes('/analytics/risk-distribution')) {
          return { data: { data: { distribution } }, status: 200 };
        }

        if (url.includes('/analytics/top-suspicious')) {
          return { data: { data: { accounts: topSuspicious } }, status: 200 };
        }

        if (url.includes('/export/transactions/csv') || url.includes('/export/alerts/csv')) {
          const csv = 'id,account,amount\nTXN-001,ACC-2024-001,5234\nTXN-002,ACC-2024-089,892';
          const blob = new Blob([csv], { type: 'text/csv' });
          return { data: blob, status: 200 };
        }

        if (url.includes('/export/alert') && url.endsWith('/pdf')) {
          const pdfContent = 'PDF placeholder for alert';
          const blob = new Blob([pdfContent], { type: 'application/pdf' });
          return { data: blob, status: 200 };
        }

        return null;
      };

      try {
        const mock = getMock();
        if (mock) {
          // mimic a short network delay
          await new Promise((r) => setTimeout(r, 300));
          return mock;
        }
      } catch (e) {
        // fallthrough to reject
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
