// Reports & Analytics Page

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NavBar, Card, CardHeader, CardTitle, CardContent } from '@/components';
import apiClient from '@/lib/api';

interface FraudStats {
  totalTransactions: number;
  flaggedTransactions: number;
  fraudRate: number;
  totalAccounts: number;
  highRiskAccounts: number;
  openAlerts: number;
  criticalAlerts: number;
}

interface Trend {
  date: string;
  total: number;
  flagged: number;
  percentage: number;
}

interface RiskDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [stats, setStats] = useState<FraudStats | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
  const [topSuspicious, setTopSuspicious] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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

    void loadAnalytics();
  }, [mounted, loading, user]);

  const loadAnalytics = async () => {
    try {
      setLoadingData(true);

      const [statsRes, trendsRes, riskRes, suspiciousRes] = await Promise.all([
        apiClient.get('/analytics/fraud-stats'),
        apiClient.get('/analytics/trends'),
        apiClient.get('/analytics/risk-distribution'),
        apiClient.get('/analytics/top-suspicious'),
      ]);

      setStats(statsRes.data.data.stats);
      setTrends(trendsRes.data.data.trends);
      setRiskDistribution(riskRes.data.data.distribution);
      setTopSuspicious(suspiciousRes.data.data.accounts);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoadingData(false);
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
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Reports & Analytics</h2>
          <p className="text-slate-600">Comprehensive fraud detection metrics and trends.</p>
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent>
                    <div className="pt-4">
                      <p className="text-slate-500 text-sm mb-1">Total Transactions</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalTransactions.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="pt-4">
                      <p className="text-slate-400 text-sm mb-1">Flagged Transactions</p>
                      <p className="text-3xl font-bold text-red-400">{stats.flaggedTransactions.toLocaleString()}</p>
                      <p className="text-sm text-slate-500 mt-2">{stats.fraudRate.toFixed(2)}% fraud rate</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="pt-4">
                      <p className="text-slate-400 text-sm mb-1">High Risk Accounts</p>
                      <p className="text-3xl font-bold text-orange-400">{stats.highRiskAccounts}</p>
                      <p className="text-sm text-slate-500 mt-2">of {stats.totalAccounts} total</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="pt-4">
                      <p className="text-slate-400 text-sm mb-1">Critical Alerts</p>
                      <p className="text-3xl font-bold text-red-500">{stats.criticalAlerts}</p>
                      <p className="text-sm text-slate-500 mt-2">{stats.openAlerts} open total</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Risk Distribution */}
            {riskDistribution && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Critical (0.9-1.0)</span>
                        <span className="text-slate-900 font-semibold">{riskDistribution.critical}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-red-600"
                          style={{ width: `${(riskDistribution.critical / riskDistribution.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">High (0.7-0.9)</span>
                        <span className="text-white font-semibold">{riskDistribution.high}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-orange-600"
                          style={{ width: `${(riskDistribution.high / riskDistribution.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Medium (0.5-0.7)</span>
                        <span className="text-white font-semibold">{riskDistribution.medium}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-yellow-600"
                          style={{ width: `${(riskDistribution.medium / riskDistribution.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Low (0-0.5)</span>
                        <span className="text-white font-semibold">{riskDistribution.low}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{ width: `${(riskDistribution.low / riskDistribution.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 7-Day Trend */}
            {trends.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>7-Day Transaction Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-4 text-slate-600">Date</th>
                          <th className="text-right py-2 px-4 text-slate-600">Total</th>
                          <th className="text-right py-2 px-4 text-slate-600">Flagged</th>
                          <th className="text-right py-2 px-4 text-slate-600">Fraud %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trends.map((trend, idx) => (
                          <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-900">{trend.date}</td>
                            <td className="py-3 px-4 text-right text-slate-700">{trend.total}</td>
                            <td className="py-3 px-4 text-right text-red-500">{trend.flagged}</td>
                            <td className="py-3 px-4 text-right text-amber-600">{trend.percentage.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Suspicious Accounts */}
            {topSuspicious.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Suspicious Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topSuspicious.map((account, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div>
                          <p className="text-white font-medium">{account.accountNumber || account.id}</p>
                          <p className="text-sm text-slate-400">Status: {account.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">Risk: {(account.riskScore * 100).toFixed(0)}%</p>
                          <p className="text-sm text-slate-400">${(account.balance || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
