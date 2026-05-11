// Alerts Page

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api';
import { NavBar, Card, CardContent, Button } from '@/components';

interface Alert {
  _id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  accountId: string;
  fraudScore: number;
  status: string;
  createdAt?: string;
  investigatorId?: string;
}

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/alerts');
      setAlerts(response.data.data.alerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (alertId: string) => {
    try {
      setActionInProgress(alertId);
      await apiClient.patch(`/alerts/${alertId}/review`, {});
      await fetchAlerts();
    } catch (error) {
      console.error('Failed to review alert:', error);
      alert('Failed to review alert');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      if (!confirm('Are you sure you want to dismiss this alert?')) return;
      setActionInProgress(alertId);
      await apiClient.patch(`/alerts/${alertId}/dismiss`, {});
      await fetchAlerts();
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      alert('Failed to dismiss alert');
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);
  const canModifyAlerts = user?.role === 'admin' || user?.role === 'investigator';

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Fraud Alerts</h2>
          <p className="text-slate-400">Monitor and manage suspicious transaction alerts in real-time.</p>
          {user?.role === 'auditor' && (
            <p className="text-slate-500 text-sm mt-2">
              📋 Auditor mode: Read-only access. Contact an investigator to review or dismiss alerts.
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-700">
          {[
            { id: 'all', label: 'All Alerts', count: alerts.length },
            { id: 'open', label: 'Open', count: alerts.filter(a => a.status === 'open').length },
            { id: 'investigating', label: 'Investigating', count: alerts.filter(a => a.status === 'investigating').length },
            { id: 'resolved', label: 'Resolved', count: alerts.filter(a => a.status === 'resolved').length },
            { id: 'false_positive', label: 'Dismissed', count: alerts.filter(a => a.status === 'false_positive').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                filter === tab.id
                  ? 'border-cyan-500 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label} <span className="text-xs">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-400">Loading alerts...</p>
              </CardContent>
            </Card>
          ) : filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <Card key={alert._id} className="hover:border-slate-600 transition">
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
                          {alert.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-3">{alert.description}</p>
                      <div className="flex items-center gap-6 text-sm flex-wrap">
                        <div>
                          <p className="text-slate-400">Account ID</p>
                          <p className="text-white font-mono">{alert.accountId}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Fraud Score</p>
                          <p className="text-white font-semibold">{(alert.fraudScore * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Created</p>
                          <p className="text-white">{alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        {alert.investigatorId && (
                          <div>
                            <p className="text-slate-400">Investigator</p>
                            <p className="text-white font-mono text-xs">{alert.investigatorId}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {canModifyAlerts && (
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleReview(alert._id)}
                          disabled={actionInProgress === alert._id || alert.status !== 'open'}
                        >
                          {actionInProgress === alert._id ? 'Loading...' : 'Review'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDismiss(alert._id)}
                          disabled={actionInProgress === alert._id || alert.status !== 'open'}
                        >
                          {actionInProgress === alert._id ? 'Loading...' : 'Dismiss'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-400 text-lg mb-4">No {filter} alerts at this time</p>
                <p className="text-slate-500 text-sm">All transactions are looking normal. Keep monitoring for any suspicious activity.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
