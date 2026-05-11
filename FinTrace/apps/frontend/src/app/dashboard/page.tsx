// Dashboard Page

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NavBar, Card, CardHeader, CardTitle, CardContent, StatCard, Button } from '@/components';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar showNav title="FinTrace" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.fullName}!</h2>
          <p className="text-slate-400">Here's your fraud detection overview for today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Transactions" value="12,453" change={5.2} icon="📊" />
          <StatCard title="Fraud Detected" value="47" change={-2.1} icon="🚨" />
          <StatCard title="Success Rate" value="99.6%" change={0.8} icon="✅" />
          <StatCard title="Avg Risk Score" value="2.4/10" change={-1.3} icon="📈" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Fraud Attempts Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Fraud Detection Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300 text-sm">Attempted Frauds</span>
                    <span className="text-white font-semibold">127</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300 text-sm">Successfully Detected</span>
                    <span className="text-white font-semibold">124</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '97.6%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300 text-sm">False Positives</span>
                    <span className="text-white font-semibold">3</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '2.4%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Critical (0.9-1.0)', count: 8, color: 'bg-red-600' },
                  { label: 'High (0.7-0.9)', count: 24, color: 'bg-orange-600' },
                  { label: 'Medium (0.4-0.7)', count: 65, color: 'bg-yellow-600' },
                  { label: 'Low (0-0.4)', count: 187, color: 'bg-green-600' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm">{item.label}</span>
                      <span className="text-slate-400 text-sm">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(item.count / 284) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Suspicious Activities</CardTitle>
              <Link href="/alerts">
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 1, account: 'ACC-2024-001', amount: '$5,234', time: '2 min ago', risk: 'High', type: 'Rapid transactions' },
                { id: 2, account: 'ACC-2024-042', amount: '$1,245', time: '15 min ago', risk: 'Medium', type: 'Unusual location' },
                { id: 3, account: 'ACC-2024-089', amount: '$892', time: '32 min ago', risk: 'Low', type: 'Late-night transaction' },
                { id: 4, account: 'ACC-2024-156', amount: '$3,567', time: '1 hour ago', risk: 'High', type: 'Multiple failed attempts' },
                { id: 5, account: 'ACC-2024-234', amount: '$742', time: '2 hours ago', risk: 'Low', type: 'International transfer' },
              ].map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition">
                  <div className="flex-1">
                    <p className="text-white font-medium">{alert.account}</p>
                    <p className="text-sm text-slate-400">{alert.type} • {alert.time}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-white font-semibold">{alert.amount}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium mt-1 ${
                      alert.risk === 'High' ? 'bg-red-500/20 text-red-300' :
                      alert.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {alert.risk} Risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
