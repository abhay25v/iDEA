// FIU Export Center Page

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NavBar, Card, CardHeader, CardTitle, CardContent, Button } from '@/components';
import apiClient from '@/lib/api';

interface Alert {
  _id: string;
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  accountId: string;
  fraudScore: number;
  status: string;
  createdAt?: string;
}

export default function FIUExportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!mounted || loading || !user) {
      return;
    }

    void fetchAlerts();
  }, [mounted, loading, user]);

  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const response = await apiClient.get('/alerts');
      setAlerts(response.data.data.alerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleExportPDF = async (alertId: string) => {
    try {
      setExportingId(alertId);
      const response = await apiClient.get(`/export/alert/${alertId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `alert_${alertId}_evidence.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF');
    } finally {
      setExportingId(null);
    }
  };

  const handleExportTransactionsCSV = async () => {
    try {
      const response = await apiClient.get('/export/transactions/csv', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV');
    }
  };

  const handleExportAlertsCSV = async () => {
    try {
      const response = await apiClient.get('/export/alerts/csv', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'alerts.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV');
    }
  };

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar showNav title="FinTrace" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">FIU Export Center</h2>
          <p className="text-slate-600">Generate and download evidence packages for financial investigations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Export Options */}
          <Card className="lg:col-span-1 border-green-500/20 bg-white">
            <CardHeader>
              <CardTitle>Quick Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="primary" size="sm" onClick={handleExportTransactionsCSV} className="w-full">
                Export All Transactions (CSV)
              </Button>
              <Button variant="primary" size="sm" onClick={handleExportAlertsCSV} className="w-full">
                Export All Alerts (CSV)
              </Button>
              <p className="text-xs text-slate-500 mt-4">Export bulk data in standard CSV format for external systems.</p>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Export Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-sm">Available Alerts</p>
                  <p className="text-3xl font-bold text-slate-900">{alerts.length}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Critical Alerts</p>
                  <p className="text-3xl font-bold text-red-500">{alerts.filter((a) => a.severity === 'critical').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert List for Export */}
        <Card>
          <CardHeader>
            <CardTitle>Export Alert Evidence Packages</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAlerts ? (
              <p className="text-slate-400">Loading alerts...</p>
            ) : alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition"
                  >
                    <div className="flex-1">
                      <h4 className="text-slate-900 font-medium">{alert.title}</h4>
                      <p className="text-sm text-slate-600">{alert.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span>ID: {alert.id}</span>
                        <span>Account: {alert.accountId}</span>
                        <span>Score: {(alert.fraudScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.severity === 'critical'
                            ? 'bg-red-500/20 text-red-300'
                            : alert.severity === 'high'
                              ? 'bg-orange-500/20 text-orange-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleExportPDF(alert.id)}
                        disabled={exportingId === alert.id}
                      >
                        {exportingId === alert.id ? 'Exporting...' : 'Export PDF'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No alerts available for export.</p>
            )}
          </CardContent>
        </Card>

        {/* Export Guide */}
        <Card className="mt-6 bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm">Export Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400 space-y-2">
            <p>
              <strong>PDF Evidence Package:</strong> Contains complete investigation details including transaction chains, account
              information, fraud scores, and anomaly explanations.
            </p>
            <p>
              <strong>CSV Export:</strong> Bulk export all transactions or alerts for external analysis, compliance reporting, or data
              integration.
            </p>
            <p>
              <strong>Use Cases:</strong> File with financial authorities, share with compliance teams, archive for audit trails, or
              forward to external investigators.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
