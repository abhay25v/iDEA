// Home Page

'use client';

import Link from 'next/link';
import { Button } from '@/components';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            FinTrace
          </h1>
          <Link href="/login">
            <Button variant="primary" size="md">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
          AI-Powered Banking Fraud Detection
        </h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          FinTrace uses advanced machine learning and graph analytics to detect suspicious transaction patterns and protect your banking network.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/login">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="secondary" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Real-time Monitoring', description: 'Monitor transactions in real-time' },
            { title: 'ML-Powered Detection', description: 'Advanced anomaly detection algorithms' },
            { title: 'Graph Analysis', description: 'Visualize fund movement patterns' },
            { title: 'Risk Scoring', description: 'Multi-factor fraud probability scoring' },
            { title: 'Alert Management', description: 'Intelligent alert triage and routing' },
            { title: 'Evidence Export', description: 'Generate FIU-compliant reports' },
          ].map((feature, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition">
              <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-400">
          <p>&copy; 2024 FinTrace. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
