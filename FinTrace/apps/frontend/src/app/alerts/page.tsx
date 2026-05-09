// Alerts Page

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NavBar, Card, CardHeader, CardTitle, CardContent, Button } from '@/components';

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  accountId: string;
  fraudScore: number;
  status: string;
  amount?: number;
  timestamp?: string;
}

export default function AlertsPage() {
  const { user, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'rapid_transactions',
      severity: 'high',
      title: 'Rapid Transactions Detected',
      description: '5 transactions in 10 minutes from account ACC-2024-001',
      accountId: 'ACC-2024-001',
      fraudScore: 0.92,
      status: 'open',
      amount: 15000,
      timestamp: '2 min ago',
    },
    {
      id: '2',
      type: 'location_anomaly',
      severity: 'medium',
      title: 'Unusual Location Transaction',
      description: 'Transaction from different country than usual',
      accountId: 'ACC-2024-042',
      fraudScore: 0.65,
      status: 'open',
      amount: 2500,
      timestamp: '15 min ago',
    },
    {
      id: '3',
      type: 'failed_attempts',
      severity: 'high',
      title: 'Multiple Failed Login Attempts',
      description: '7 failed login attempts in 30 minutes',
      accountId: 'ACC-2024-156',
      fraudScore: 0.88,
      status: 'open',
      amount: 0,
      timestamp: '1 hour ago',
    },
  ]);
  const [filter, setFilter] = useState('all');

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar showNav title="FinTrace" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Fraud Alerts</h2>
          <p className="text-slate-400">Monitor and manage suspicious transaction alerts in real-time.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          {[
            { id: 'all', label: 'All Alerts', count: alerts.length },
            { id: 'open', label: 'Open', count: alerts.filter(a => a.status === 'open').length },
            { id: 'resolved', label: 'Resolved', count: alerts.filter(a => a.status === 'resolved').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                filter === tab.id
                  ? 'border-purple-600 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label} <span className="text-xs">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className="hover:border-slate-600 transition">
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
                        {alert.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-3">{alert.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <p className="text-slate-400">Account ID</p>
                        <p className="text-white font-mono">{alert.accountId}</p>
                      </div>
                      {alert.amount > 0 && (
                        <div>
                          <p className="text-slate-400">Amount</p>
                          <p className="text-white font-semibold">${alert.amount.toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-400">Fraud Score</p>
                        <p className="text-white font-semibold">{(alert.fraudScore * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Time</p>
                        <p className="text-white">{alert.timestamp}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="primary" size="sm">
                      Review
                    </Button>
                    <Button variant="secondary" size="sm">
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-400 text-lg mb-4">No {filter} alerts at this time</p>
              <p className="text-slate-500 text-sm">All transactions are looking normal. Keep monitoring for any suspicious activity.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
