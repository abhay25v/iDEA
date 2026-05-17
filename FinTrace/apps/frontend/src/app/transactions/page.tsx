// Transactions Page

'use client';

import { useState } from 'react';
import { NavBar, Card, CardHeader, CardTitle, CardContent } from '@/components';
import { Search } from 'lucide-react';

interface Transaction {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  type: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description?: string;
}

export default function TransactionsPage() {
  const [transactions] = useState<Transaction[]>([
    {
      id: 'TXN-001',
      sourceAccountId: 'ACC-2024-001',
      destinationAccountId: 'ACC-2024-042',
      amount: 5234,
      type: 'transfer',
      status: 'completed',
      timestamp: '2 min ago',
      description: 'Online Transfer',
    },
    {
      id: 'TXN-002',
      sourceAccountId: 'ACC-2024-089',
      destinationAccountId: 'ACC-2024-001',
      amount: 892,
      type: 'deposit',
      status: 'completed',
      timestamp: '15 min ago',
      description: 'Direct Deposit',
    },
    {
      id: 'TXN-003',
      sourceAccountId: 'ACC-2024-156',
      destinationAccountId: 'EXT-XYZ-789',
      amount: 3567,
      type: 'withdrawal',
      status: 'pending',
      timestamp: '32 min ago',
      description: 'ATM Withdrawal',
    },
    {
      id: 'TXN-004',
      sourceAccountId: 'ACC-2024-234',
      destinationAccountId: 'ACC-2024-001',
      amount: 742,
      type: 'transfer',
      status: 'completed',
      timestamp: '1 hour ago',
      description: 'International Transfer',
    },
    {
      id: 'TXN-005',
      sourceAccountId: 'ACC-2024-001',
      destinationAccountId: 'MERCHANT-ABC',
      amount: 125,
      type: 'payment',
      status: 'failed',
      timestamp: '2 hours ago',
      description: 'Payment Declined',
    },
  ]);
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter(t =>
    t.id.includes(search.toUpperCase()) ||
    t.sourceAccountId.includes(search) ||
    t.destinationAccountId.includes(search)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return '↔️';
      case 'deposit':
        return '⬇️';
      case 'withdrawal':
        return '⬆️';
      case 'payment':
        return '💳';
      default:
        return '💰';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar showNav title="FinTrace" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Transaction History</h2>
          <p className="text-slate-600">Monitor all transactions in real-time with fraud detection.</p>
        </div>

        {/* Search Bar */}
          <Card className="mb-6">
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by Transaction ID, Account ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Transaction ID</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">From</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">To</th>
                    <th className="text-right py-3 px-4 text-slate-400 text-sm font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-slate-200/80 hover:bg-slate-50 transition">
                          <td className="py-3 px-4">
                            <span className="text-lg">{getTypeIcon(txn.type)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-900 font-mono text-sm">{txn.id}</span>
                            <p className="text-slate-500 text-xs">{txn.description}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-700 text-sm">{txn.sourceAccountId}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-700 text-sm">{txn.destinationAccountId}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-slate-900 font-semibold">${txn.amount.toLocaleString()}</span>
                          </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 text-xs rounded-full font-medium border ${getStatusColor(txn.status)}`}>
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm">{txn.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredTransactions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-400 text-lg">No transactions found matching your search</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
