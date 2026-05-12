// Dashboard Page

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NavBar, Card, CardHeader, CardTitle, CardContent, StatCard, Button } from '@/components';
import Link from 'next/link';

const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8000';

const defaultAssessmentForm = {
  account_id: 'ACC_001',
  transaction_amount: '5000',
  transaction_frequency: '2',
  account_age: '365',
  transfer_velocity: '1',
  geographic_deviation: false,
  device_mismatch: false,
  balance_anomaly: false,
  account_kyc_status: 'verified',
  last_transaction_time: '',
};

interface PredictionResult {
  account_id: string;
  fraud_probability: number;
  anomaly_score: number;
  risk_level: string;
  features: Record<string, unknown>;
  explanation: string;
}

type AssessmentForm = typeof defaultAssessmentForm;

const riskBadgeClasses: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-300 border-green-500/30',
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState<AssessmentForm>(defaultAssessmentForm);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

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

    void runAssessment(defaultAssessmentForm);
  }, [mounted, loading, user]);

  const runAssessment = async (form: AssessmentForm = assessmentForm) => {
    try {
      setPredicting(true);
      setPredictionError(null);

      const response = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: form.account_id,
          transaction_amount: Number(form.transaction_amount),
          transaction_frequency: Number(form.transaction_frequency),
          account_age: Number(form.account_age),
          transfer_velocity: Number(form.transfer_velocity),
          geographic_deviation: form.geographic_deviation,
          device_mismatch: form.device_mismatch,
          balance_anomaly: form.balance_anomaly,
          account_kyc_status: form.account_kyc_status,
          last_transaction_time: form.last_transaction_time ? Number(form.last_transaction_time) : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`ML service returned ${response.status}`);
      }

      const data = (await response.json()) as PredictionResult;
      setPrediction(data);
    } catch (error) {
      console.error('Failed to run ML assessment:', error);
      setPredictionError('Unable to fetch a live ML result right now. The dashboard will keep showing the last known assessment.');
    } finally {
      setPredicting(false);
    }
  };

  const loadScenario = (scenario: 'normal' | 'high-risk') => {
    const nextForm =
      scenario === 'high-risk'
        ? {
            account_id: 'ACC_010',
            transaction_amount: '15000',
            transaction_frequency: '14',
            account_age: '12',
            transfer_velocity: '8',
            geographic_deviation: true,
            device_mismatch: true,
            balance_anomaly: true,
            account_kyc_status: 'rejected',
            last_transaction_time: '1715587200',
          }
        : defaultAssessmentForm;

    setAssessmentForm(nextForm);
    void runAssessment(nextForm);
  };

  const updateField = <K extends keyof AssessmentForm>(field: K, value: AssessmentForm[K]) => {
    setAssessmentForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

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
          <StatCard
            title="Live Fraud Probability"
            value={prediction ? `${Math.round(prediction.fraud_probability * 100)}%` : predicting ? 'Updating' : '—'}
            change={prediction ? Math.round((prediction.fraud_probability - 0.24) * 100) / 100 : undefined}
            icon="🧠"
          />
        </div>

        {/* ML Assessment */}
        <Card className="mb-8 border-cyan-500/20 bg-slate-900/70">
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>ML Risk Analyzer</CardTitle>
                <p className="text-slate-400 text-sm mt-1">
                  Run the fraud model directly from the dashboard and inspect the live result here.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="secondary" size="sm" onClick={() => loadScenario('normal')} disabled={predicting}>
                  Load normal case
                </Button>
                <Button variant="secondary" size="sm" onClick={() => loadScenario('high-risk')} disabled={predicting}>
                  Load high-risk case
                </Button>
                <Button variant="primary" size="sm" onClick={() => void runAssessment()} disabled={predicting}>
                  {predicting ? 'Analyzing...' : 'Run assessment'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-slate-400 mb-2 block">Account ID</span>
                    <input
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-500"
                      value={assessmentForm.account_id}
                      onChange={(event) => updateField('account_id', event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400 mb-2 block">Transaction amount</span>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-500"
                      value={assessmentForm.transaction_amount}
                      onChange={(event) => updateField('transaction_amount', event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400 mb-2 block">Transaction frequency</span>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-500"
                      value={assessmentForm.transaction_frequency}
                      onChange={(event) => updateField('transaction_frequency', event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400 mb-2 block">Account age (days)</span>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-500"
                      value={assessmentForm.account_age}
                      onChange={(event) => updateField('account_age', event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400 mb-2 block">Transfer velocity</span>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-500"
                      value={assessmentForm.transfer_velocity}
                      onChange={(event) => updateField('transfer_velocity', event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-400 mb-2 block">KYC status</span>
                    <select
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-500"
                      value={assessmentForm.account_kyc_status}
                      onChange={(event) => updateField('account_kyc_status', event.target.value)}
                    >
                      <option value="verified">verified</option>
                      <option value="pending">pending</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={assessmentForm.geographic_deviation}
                      onChange={(event) => updateField('geographic_deviation', event.target.checked)}
                    />
                    Geographic deviation
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={assessmentForm.device_mismatch}
                      onChange={(event) => updateField('device_mismatch', event.target.checked)}
                    />
                    Device mismatch
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={assessmentForm.balance_anomaly}
                      onChange={(event) => updateField('balance_anomaly', event.target.checked)}
                    />
                    Balance anomaly
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm text-slate-400 mb-2 block">Last transaction time</span>
                  <input
                    type="number"
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-500"
                    placeholder="Optional UNIX timestamp"
                    value={assessmentForm.last_transaction_time}
                    onChange={(event) => updateField('last_transaction_time', event.target.value)}
                  />
                </label>

                {predictionError && <p className="text-sm text-red-300">{predictionError}</p>}
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 shadow-lg shadow-cyan-950/10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-slate-400 text-sm">Model output</p>
                    <h3 className="text-xl font-semibold text-white">
                      {prediction ? prediction.account_id : 'Waiting for assessment'}
                    </h3>
                  </div>
                  {prediction && (
                    <span className={`px-3 py-1 text-xs rounded-full border font-medium ${riskBadgeClasses[prediction.risk_level] || riskBadgeClasses.low}`}>
                      {prediction.risk_level.toUpperCase()}
                    </span>
                  )}
                </div>

                {prediction ? (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Fraud probability</span>
                        <span className="text-white font-semibold">{Math.round(prediction.fraud_probability * 100)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${prediction.fraud_probability * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Anomaly score</span>
                        <span className="text-white font-semibold">{Math.round(prediction.anomaly_score * 100)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${prediction.anomaly_score * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400 mb-2">Explanation</p>
                      <p className="text-slate-100 leading-6">{prediction.explanation}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400 mb-3">Features sent to the model</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(prediction.features).map(([label, value]) => (
                          <div key={label} className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
                            <p className="text-xs uppercase tracking-wide text-slate-500">{label.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-white mt-1">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 px-4 py-10 text-center">
                    <p className="text-slate-300 mb-2">No model result yet.</p>
                    <p className="text-sm text-slate-500">Run the assessment to see fraud probability, anomaly score, risk level, and explanation here.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
