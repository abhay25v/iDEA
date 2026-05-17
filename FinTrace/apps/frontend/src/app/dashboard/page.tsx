// Dashboard Page

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
  critical: 'bg-red-100 text-red-700 border-red-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Generate a plausible mock prediction when backend is unreachable.
  const generateMockPrediction = (form: AssessmentForm): PredictionResult => {
    const amount = Number(form.transaction_amount) || 0;
    const freq = Number(form.transaction_frequency) || 0;
    const age = Number(form.account_age) || 0;
    const velocity = Number(form.transfer_velocity) || 0;

    // Simple heuristic to produce a fraud probability between 0 and 1
    let base = Math.min(0.95, Math.max(0.02, amount / 20000 + freq / 50 + velocity / 20));
    if (form.balance_anomaly) base += 0.12;
    if (form.geographic_deviation) base += 0.08;
    if (form.device_mismatch) base += 0.08;
    if (form.account_kyc_status === 'rejected') base += 0.08;
    base = Math.min(0.99, base);

    const fraud_probability = Math.round(base * 100) / 100;
    const anomaly_score = Math.round(Math.min(1, base * (0.9 + Math.random() * 0.2)) * 100) / 100;
    const risk_level = fraud_probability > 0.8 ? 'critical' : fraud_probability > 0.6 ? 'high' : fraud_probability > 0.35 ? 'medium' : 'low';

    return {
      account_id: form.account_id,
      fraud_probability,
      anomaly_score,
      risk_level,
      features: {
        transaction_amount: form.transaction_amount,
        transaction_frequency: form.transaction_frequency,
        account_age: form.account_age,
        transfer_velocity: form.transfer_velocity,
        geographic_deviation: form.geographic_deviation,
        device_mismatch: form.device_mismatch,
        balance_anomaly: form.balance_anomaly,
        account_kyc_status: form.account_kyc_status,
      },
      explanation:
        'This is a locally-generated mock prediction used when the ML backend is unreachable. Treat as a demo placeholder.',
    };
  };
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

  const runAssessment = useCallback(async (form: AssessmentForm) => {
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
      setPredictionError('Unable to fetch a live ML result right now. Showing a local mock result instead.');

      // Provide a plausible mock so the UI still shows realistic data.
      const mock = generateMockPrediction(form);
      // small delay to mimic network/backend latency
      await new Promise((r) => setTimeout(r, 400));
      // only replace if there's no previous prediction (keep last known if present)
      setPrediction((prev) => prev ?? mock);
    } finally {
      setPredicting(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted || loading || !user) {
      return;
    }

    void runAssessment(defaultAssessmentForm);
  }, [mounted, loading, user, runAssessment]);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <NavBar showNav title="FinTrace" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">Welcome back, {user.fullName}!</h2>
          <p className="text-slate-600 text-lg">Monitor fraud detection metrics and manage your security in real-time.</p>
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
        <Card className="mb-8 border-blue-200 bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-2xl mb-1">ML Risk Analyzer</CardTitle>
                <p className="text-slate-600 text-sm font-medium">
                  Assess transaction risk using advanced machine learning models
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="secondary" size="sm" onClick={() => loadScenario('normal')} disabled={predicting}>
                  Load normal case
                </Button>
                <Button variant="secondary" size="sm" onClick={() => loadScenario('high-risk')} disabled={predicting}>
                  Load high-risk case
                </Button>
                <Button variant="primary" size="sm" onClick={() => void runAssessment(assessmentForm)} disabled={predicting}>
                  {predicting ? 'Analyzing...' : 'Run assessment'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Assessment Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 mb-2 block">Account ID</span>
                    <input
                      className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={assessmentForm.account_id}
                      onChange={(event) => updateField('account_id', event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 mb-2 block">Transaction amount</span>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={assessmentForm.transaction_amount}
                      onChange={(event) => updateField('transaction_amount', event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 mb-2 block">Transaction frequency</span>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={assessmentForm.transaction_frequency}
                      onChange={(event) => updateField('transaction_frequency', event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 mb-2 block">Account age (days)</span>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={assessmentForm.account_age}
                      onChange={(event) => updateField('account_age', event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 mb-2 block">Transfer velocity</span>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      value={assessmentForm.transfer_velocity}
                      onChange={(event) => updateField('transfer_velocity', event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 mb-2 block">KYC status</span>
                    <select
                      className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                  <label className="flex items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={assessmentForm.geographic_deviation}
                      onChange={(event) => updateField('geographic_deviation', event.target.checked)}
                    />
                    Geographic deviation
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={assessmentForm.device_mismatch}
                      onChange={(event) => updateField('device_mismatch', event.target.checked)}
                    />
                    Device mismatch
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={assessmentForm.balance_anomaly}
                      onChange={(event) => updateField('balance_anomaly', event.target.checked)}
                    />
                    Balance anomaly
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 mb-2 block">Last transaction time</span>
                  <input
                    type="number"
                    className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Optional UNIX timestamp"
                    value={assessmentForm.last_transaction_time}
                    onChange={(event) => updateField('last_transaction_time', event.target.value)}
                  />
                </label>

                {predictionError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{predictionError}</p>}
              </div>

              <div className="rounded-2xl border border-blue-300 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-md">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-slate-600 text-sm font-bold uppercase tracking-wide">Model Result</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
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
                        <span className="text-sm font-medium text-slate-700">Fraud probability</span>
                        <span className="text-slate-900 font-bold">{Math.round(prediction.fraud_probability * 100)}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${prediction.fraud_probability * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Anomaly score</span>
                        <span className="text-slate-900 font-bold">{Math.round(prediction.anomaly_score * 100)}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600" style={{ width: `${prediction.anomaly_score * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Explanation</p>
                      <p className="text-slate-700 leading-6 bg-white/50 p-3 rounded-lg">{prediction.explanation}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-3">Features sent to the model</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(prediction.features).map(([label, value]) => (
                          <div key={label} className="rounded-lg border border-slate-300 bg-white px-3 py-2">
                            <p className="text-xs uppercase tracking-wide text-slate-600 font-semibold">{label.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-slate-900 mt-1 font-medium">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                    <p className="text-slate-700 mb-2 font-medium">No model result yet.</p>
                    <p className="text-sm text-slate-600">Run the assessment to see fraud probability, anomaly score, risk level, and explanation here.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Performance Metrics</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Fraud Attempts Over Time */}
          <Card className="bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle>Daily Fraud Detection Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-700 text-sm font-medium">Attempted Frauds</span>
                    <span className="text-slate-900 font-bold">127</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-700 text-sm font-medium">Successfully Detected</span>
                    <span className="text-slate-900 font-bold">124</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full" style={{ width: '97.6%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-700 text-sm font-medium">False Positives</span>
                    <span className="text-slate-900 font-bold">3</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full" style={{ width: '2.4%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Critical (0.9-1.0)', count: 8, color: 'bg-gradient-to-r from-red-500 to-red-600' },
                  { label: 'High (0.7-0.9)', count: 24, color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
                  { label: 'Medium (0.4-0.7)', count: 65, color: 'bg-gradient-to-r from-amber-500 to-amber-600' },
                  { label: 'Low (0-0.4)', count: 187, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-700 text-sm font-medium">{item.label}</span>
                      <span className="text-slate-900 text-sm font-bold">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className={`${item.color} h-3 rounded-full`} style={{ width: `${(item.count / 284) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Security Alerts</h3>
        </div>
        <Card className="bg-gradient-to-br from-white to-slate-50 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Suspicious Activities</CardTitle>
              <Link href="/alerts">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
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
                <div key={alert.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-300 hover:border-blue-300 hover:shadow-md transition">
                  <div className="flex-1">
                    <p className="text-slate-900 font-semibold">{alert.account}</p>
                    <p className="text-sm text-slate-600">{alert.type} • {alert.time}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-slate-900 font-bold">{alert.amount}</p>
                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold mt-1 ${
                      alert.risk === 'High' ? 'bg-red-100 text-red-700 border border-red-300' :
                      alert.risk === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                      'bg-emerald-100 text-emerald-700 border border-emerald-300'
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
